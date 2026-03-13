import SwiftUI

/// Shows download and installation progress.
struct InstallProgressView: View {
    let currentPlugin: String
    let currentFormat: String
    let progress: Double
    let overallProgress: Double
    let totalSteps: Int
    let currentStep: Int
    let log: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Overall progress
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Progresso Totale")
                        .font(.headline)
                    Spacer()
                    Text("\(currentStep)/\(totalSteps)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                ProgressView(value: overallProgress)
                    .progressViewStyle(.linear)
            }

            // Current download
            VStack(alignment: .leading, spacing: 4) {
                Text("Scaricando: \(currentPlugin) (\(currentFormat))")
                    .font(.subheadline)
                ProgressView(value: progress)
                    .progressViewStyle(.linear)
                Text("\(Int(progress * 100))%")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Log
            if !log.isEmpty {
                Divider()
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 2) {
                            ForEach(Array(log.enumerated()), id: \.offset) { index, entry in
                                Text(entry)
                                    .font(.system(.caption, design: .monospaced))
                                    .foregroundColor(.secondary)
                                    .id(index)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxHeight: 150)
                    .onChange(of: log.count) { _ in
                        if let last = log.indices.last {
                            proxy.scrollTo(last, anchor: .bottom)
                        }
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.05))
        )
    }
}
