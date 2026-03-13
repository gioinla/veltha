import SwiftUI

/// View model that orchestrates the download and installation process.
@MainActor
final class InstallerViewModel: ObservableObject {
    @Published var selectedPlugins: Set<String> = []
    @Published var selectedFormats: Set<PluginFormat> = [.au, .vst3]
    @Published var includeFX = false
    @Published var installedPlugins: [String: [PluginFormat]] = [:]

    // Progress tracking
    @Published var isWorking = false
    @Published var downloadProgress: Double = 0
    @Published var overallProgress: Double = 0
    @Published var currentPluginName = ""
    @Published var currentFormatName = ""
    @Published var totalSteps = 0
    @Published var currentStep = 0
    @Published var log: [String] = []
    @Published var errorMessage: String?
    @Published var installationComplete = false

    private let downloadManager = DownloadManager()
    private let installer = PluginInstaller()

    func togglePlugin(_ id: String) {
        if selectedPlugins.contains(id) {
            selectedPlugins.remove(id)
        } else {
            selectedPlugins.insert(id)
        }
    }

    func checkExistingInstallations() {
        installedPlugins = installer.checkInstalled()
    }

    func reset() {
        isWorking = false
        downloadProgress = 0
        overallProgress = 0
        currentPluginName = ""
        currentFormatName = ""
        totalSteps = 0
        currentStep = 0
        log = []
        errorMessage = nil
        installationComplete = false
        selectedPlugins = []
        downloadManager.reset()
    }

    func startInstallation() {
        guard !selectedPlugins.isEmpty, !selectedFormats.isEmpty else { return }

        isWorking = true
        installationComplete = false
        errorMessage = nil
        log = []

        let plugins = SynthCatalog.plugins.filter { selectedPlugins.contains($0.id) }
        let formats = Array(selectedFormats)

        // Calculate total steps: each plugin x each format (+ FX variants)
        var steps = plugins.count * formats.count
        if includeFX {
            let fxPlugins = plugins.filter { $0.hasFXVariant }
            steps += fxPlugins.count * formats.count
        }
        totalSteps = steps
        currentStep = 0

        Task {
            await performInstallation(plugins: plugins, formats: formats)
        }
    }

    private func performInstallation(plugins: [SynthPlugin], formats: [PluginFormat]) async {
        let version = SynthCatalog.currentVersion

        for plugin in plugins {
            for format in formats {
                currentStep += 1
                overallProgress = Double(currentStep) / Double(totalSteps)
                currentPluginName = plugin.name
                currentFormatName = format.displayName

                let url = plugin.downloadURL(format: format, version: version)
                let label = "\(plugin.name) \(format.displayName)"
                addLog("Scaricando \(label)...")

                do {
                    let zipFile = try await downloadWithProgress(from: url, label: label)
                    addLog("Installando \(label)...")
                    try installer.install(zipFile: zipFile, format: format)
                    addLog("\(label) installato con successo.")
                } catch {
                    addLog("ERRORE: \(label) - \(error.localizedDescription)")
                    errorMessage = "Errore durante l'installazione di \(label): \(error.localizedDescription)"
                }
            }

            // FX variant
            if includeFX && plugin.hasFXVariant {
                for format in formats {
                    currentStep += 1
                    overallProgress = Double(currentStep) / Double(totalSteps)
                    currentPluginName = "\(plugin.name) FX"
                    currentFormatName = format.displayName

                    let url = plugin.downloadURL(format: format, version: version, fx: true)
                    let label = "\(plugin.name) FX \(format.displayName)"
                    addLog("Scaricando \(label)...")

                    do {
                        let zipFile = try await downloadWithProgress(from: url, label: label)
                        addLog("Installando \(label)...")
                        try installer.install(zipFile: zipFile, format: format)
                        addLog("\(label) installato con successo.")
                    } catch {
                        addLog("ERRORE: \(label) - \(error.localizedDescription)")
                        errorMessage =
                            "Errore durante l'installazione di \(label): \(error.localizedDescription)"
                    }
                }
            }
        }

        isWorking = false
        installationComplete = errorMessage == nil
        checkExistingInstallations()

        if installationComplete {
            addLog("Installazione completata con successo!")
        }
    }

    private func downloadWithProgress(from url: URL, label: String) async throws -> URL {
        // Observe download progress
        let observation = downloadManager.$progress.sink { [weak self] value in
            self?.downloadProgress = value
        }
        defer { observation.cancel() }

        return try await downloadManager.download(from: url, label: label)
    }

    private func addLog(_ message: String) {
        let timestamp = DateFormatter.localizedString(
            from: Date(), dateStyle: .none, timeStyle: .medium)
        log.append("[\(timestamp)] \(message)")
    }
}
