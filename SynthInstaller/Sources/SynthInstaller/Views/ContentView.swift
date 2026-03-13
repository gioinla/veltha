import SwiftUI

/// Main view of the Synth Installer app.
struct ContentView: View {
    @StateObject private var viewModel = InstallerViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerView
            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // ROM Warning
                    romWarningView

                    // Format picker
                    FormatPickerView(selectedFormats: $viewModel.selectedFormats)

                    // Plugin list
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Sintetizzatori Disponibili")
                            .font(.headline)

                        ForEach(SynthCatalog.plugins) { plugin in
                            PluginCardView(
                                plugin: plugin,
                                isSelected: viewModel.selectedPlugins.contains(plugin.id),
                                isInstalled: viewModel.installedPlugins[plugin.id] != nil,
                                onToggle: { viewModel.togglePlugin(plugin.id) }
                            )
                        }
                    }

                    // FX variant toggle (only if OsTIrus is selected)
                    if viewModel.selectedPlugins.contains("ostirus") {
                        Toggle("Includi anche OsTIrus FX", isOn: $viewModel.includeFX)
                            .padding(.horizontal)
                    }

                    // Progress view (during installation)
                    if viewModel.isWorking {
                        InstallProgressView(
                            currentPlugin: viewModel.currentPluginName,
                            currentFormat: viewModel.currentFormatName,
                            progress: viewModel.downloadProgress,
                            overallProgress: viewModel.overallProgress,
                            totalSteps: viewModel.totalSteps,
                            currentStep: viewModel.currentStep,
                            log: viewModel.log
                        )
                    }

                    // Error display
                    if let error = viewModel.errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text(error)
                                .foregroundColor(.red)
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.red.opacity(0.1))
                        )
                    }

                    // Success
                    if viewModel.installationComplete {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                    .font(.title2)
                                Text("Installazione completata!")
                                    .font(.headline)
                                    .foregroundColor(.green)
                            }
                            Text("I plugin sono stati installati. Riavvia la tua DAW per vederli.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("Ricorda: dovrai fornire i file ROM/firmware dei tuoi sintetizzatori hardware al primo avvio di ogni plugin.")
                                .font(.caption)
                                .foregroundColor(.orange)
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.green.opacity(0.1))
                        )
                    }
                }
                .padding()
            }

            Divider()

            // Bottom bar with install button
            bottomBar
        }
        .frame(minWidth: 700, minHeight: 600)
        .onAppear {
            viewModel.checkExistingInstallations()
        }
    }

    private var headerView: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Synth Installer")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                Text("The Usual Suspects - DSP56300 Emulator v\(SynthCatalog.currentVersion)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text("macOS Apple Silicon")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Link("GitHub", destination: URL(string: "https://github.com/dsp56300/gearmulator")!)
                    .font(.caption)
            }
        }
        .padding()
    }

    private var romWarningView: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(.blue)
            VStack(alignment: .leading, spacing: 4) {
                Text("Nota importante sui file ROM")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("Questi emulatori richiedono i file ROM/firmware originali dei sintetizzatori hardware per funzionare. I ROM non sono inclusi e devono essere ottenuti legalmente come proprietari dell'hardware originale.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.blue.opacity(0.1))
        )
    }

    private var bottomBar: some View {
        HStack {
            Text("\(viewModel.selectedPlugins.count) plugin, \(viewModel.selectedFormats.count) formati selezionati")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            if viewModel.installationComplete {
                Button("Fatto") {
                    viewModel.reset()
                }
                .buttonStyle(.bordered)
            }

            Button(action: { viewModel.startInstallation() }) {
                HStack {
                    if viewModel.isWorking {
                        ProgressView()
                            .scaleEffect(0.7)
                    }
                    Text(viewModel.isWorking ? "Installando..." : "Installa Selezionati")
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(
                viewModel.selectedPlugins.isEmpty
                    || viewModel.selectedFormats.isEmpty
                    || viewModel.isWorking
            )
        }
        .padding()
    }
}
