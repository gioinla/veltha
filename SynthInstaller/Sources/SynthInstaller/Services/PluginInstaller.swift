import Foundation

/// Handles unzipping, copying plugins to system directories, and removing quarantine.
final class PluginInstaller: ObservableObject {
    @Published var status: String = ""
    @Published var isInstalling = false
    @Published var installedPlugins: [String] = []
    @Published var error: String?

    private let fileManager = FileManager.default

    struct InstallRequest {
        let plugin: SynthPlugin
        let formats: [PluginFormat]
        let includeFX: Bool
        let version: String
    }

    /// Install a downloaded zip archive to the correct plugin directory.
    func install(zipFile: URL, format: PluginFormat) throws {
        isInstalling = true
        status = "Decomprimendo \(zipFile.lastPathComponent)..."

        // Create a temporary extraction directory
        let extractDir = fileManager.temporaryDirectory
            .appendingPathComponent("SynthInstaller-\(UUID().uuidString)")
        try fileManager.createDirectory(at: extractDir, withIntermediateDirectories: true)

        defer {
            try? fileManager.removeItem(at: extractDir)
        }

        // Unzip using ditto (macOS built-in, handles .zip well)
        let unzipProcess = Process()
        unzipProcess.executableURL = URL(fileURLWithPath: "/usr/bin/ditto")
        unzipProcess.arguments = ["-xk", zipFile.path, extractDir.path]
        try unzipProcess.run()
        unzipProcess.waitUntilExit()

        guard unzipProcess.terminationStatus == 0 else {
            throw InstallerError.unzipFailed(zipFile.lastPathComponent)
        }

        // Find plugin files in the extracted content
        let installDir = format.installDirectory
        try ensureDirectoryExists(installDir)

        status = "Installando in \(installDir.path)..."

        // Find all plugin bundles/files in extracted directory
        let contents = try deepFind(in: extractDir, extensions: pluginExtensions(for: format))

        for item in contents {
            let destPath = installDir.appendingPathComponent(item.lastPathComponent)

            // Remove existing version if present
            if fileManager.fileExists(atPath: destPath.path) {
                try fileManager.removeItem(at: destPath)
            }

            try fileManager.copyItem(at: item, to: destPath)

            // Remove quarantine attribute
            removeQuarantine(at: destPath)

            installedPlugins.append(destPath.lastPathComponent)
        }

        // Cleanup the zip
        try? fileManager.removeItem(at: zipFile)

        isInstalling = false
    }

    /// Remove the com.apple.quarantine extended attribute so macOS doesn't block unsigned plugins.
    func removeQuarantine(at url: URL) {
        status = "Rimuovendo quarantena per \(url.lastPathComponent)..."
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/xattr")
        process.arguments = ["-rd", "com.apple.quarantine", url.path]
        try? process.run()
        process.waitUntilExit()
    }

    /// Check which plugins are already installed on this system.
    func checkInstalled() -> [String: [PluginFormat]] {
        var result: [String: [PluginFormat]] = [:]
        for plugin in SynthCatalog.plugins {
            var formats: [PluginFormat] = []
            for format in plugin.availableFormats {
                let dir = format.installDirectory
                let extensions = pluginExtensions(for: format)
                for ext in extensions {
                    let pattern = plugin.productID.lowercased()
                    if let contents = try? fileManager.contentsOfDirectory(atPath: dir.path) {
                        if contents.contains(where: {
                            $0.lowercased().contains(pattern) && $0.hasSuffix(ext)
                        }) {
                            formats.append(format)
                            break
                        }
                    }
                }
            }
            if !formats.isEmpty {
                result[plugin.id] = formats
            }
        }
        return result
    }

    // MARK: - Private

    private func pluginExtensions(for format: PluginFormat) -> [String] {
        switch format {
        case .au: return [".component"]
        case .vst3: return [".vst3"]
        case .clap: return [".clap"]
        case .lv2: return [".lv2"]
        case .vst2: return [".vst"]
        }
    }

    private func ensureDirectoryExists(_ url: URL) throws {
        if !fileManager.fileExists(atPath: url.path) {
            try fileManager.createDirectory(at: url, withIntermediateDirectories: true)
        }
    }

    private func deepFind(in directory: URL, extensions: [String]) throws -> [URL] {
        var results: [URL] = []
        let enumerator = fileManager.enumerator(
            at: directory,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        )
        while let url = enumerator?.nextObject() as? URL {
            for ext in extensions {
                if url.path.hasSuffix(ext) {
                    results.append(url)
                    // Don't descend into plugin bundles
                    enumerator?.skipDescendants()
                    break
                }
            }
        }
        return results
    }
}

enum InstallerError: LocalizedError {
    case unzipFailed(String)
    case pluginNotFound(String)

    var errorDescription: String? {
        switch self {
        case .unzipFailed(let file):
            return "Impossibile decomprimere: \(file)"
        case .pluginNotFound(let name):
            return "Plugin non trovato nell'archivio: \(name)"
        }
    }
}
