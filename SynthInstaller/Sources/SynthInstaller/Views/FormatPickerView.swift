import SwiftUI

/// Allows the user to pick which plugin formats to install.
struct FormatPickerView: View {
    @Binding var selectedFormats: Set<PluginFormat>

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Formati Plugin")
                .font(.headline)
            Text("Seleziona i formati da installare:")
                .font(.caption)
                .foregroundColor(.secondary)

            HStack(spacing: 12) {
                ForEach(PluginFormat.allCases) { format in
                    Toggle(isOn: Binding(
                        get: { selectedFormats.contains(format) },
                        set: { isOn in
                            if isOn {
                                selectedFormats.insert(format)
                            } else {
                                selectedFormats.remove(format)
                            }
                        }
                    )) {
                        Text(format.displayName)
                            .font(.system(.body, design: .monospaced))
                    }
                    .toggleStyle(.checkbox)
                }
            }

            HStack(spacing: 8) {
                ForEach(PluginFormat.allCases) { format in
                    if selectedFormats.contains(format) {
                        VStack(alignment: .leading) {
                            Text(format.displayName)
                                .font(.caption2)
                                .fontWeight(.medium)
                            Text(format.installDirectory.path)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .padding(6)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(4)
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
