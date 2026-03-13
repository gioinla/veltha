import Foundation

/// Manages downloading plugin archives from GitHub releases.
final class DownloadManager: NSObject, ObservableObject, URLSessionDownloadDelegate {
    @Published var progress: Double = 0
    @Published var currentFile: String = ""
    @Published var isDownloading = false
    @Published var error: String?

    private var session: URLSession!
    private var continuation: CheckedContinuation<URL, Error>?

    override init() {
        super.init()
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 120
        session = URLSession(configuration: config, delegate: self, delegateQueue: .main)
    }

    /// Download a file from the given URL and return the local temporary file path.
    func download(from url: URL, label: String) async throws -> URL {
        isDownloading = true
        currentFile = label
        progress = 0
        error = nil

        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            let task = session.downloadTask(with: url)
            task.resume()
        }
    }

    func reset() {
        isDownloading = false
        progress = 0
        currentFile = ""
        error = nil
    }

    // MARK: - URLSessionDownloadDelegate

    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didFinishDownloadingTo location: URL
    ) {
        // Move to a temp location that won't be cleaned up immediately
        let tempDir = FileManager.default.temporaryDirectory
        let dest = tempDir.appendingPathComponent(UUID().uuidString + ".zip")
        do {
            if FileManager.default.fileExists(atPath: dest.path) {
                try FileManager.default.removeItem(at: dest)
            }
            try FileManager.default.moveItem(at: location, to: dest)
            continuation?.resume(returning: dest)
        } catch {
            continuation?.resume(throwing: error)
        }
        continuation = nil
    }

    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didWriteData bytesWritten: Int64,
        totalBytesWritten: Int64,
        totalBytesExpectedToWrite: Int64
    ) {
        if totalBytesExpectedToWrite > 0 {
            progress = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
        }
    }

    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        didCompleteWithError error: Error?
    ) {
        if let error = error {
            self.error = error.localizedDescription
            continuation?.resume(throwing: error)
            continuation = nil
        }
    }
}
