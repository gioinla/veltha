import Foundation

/// Represents a plugin format (AU, VST3, CLAP, etc.)
enum PluginFormat: String, CaseIterable, Identifiable, Codable {
    case au = "AU"
    case vst3 = "VST3"
    case clap = "CLAP"
    case lv2 = "LV2"
    case vst2 = "VST2"

    var id: String { rawValue }

    var displayName: String { rawValue }

    /// The macOS system directory where this plugin format is installed.
    var installDirectory: URL {
        let library = URL(fileURLWithPath: "/Library/Audio/Plug-Ins")
        switch self {
        case .au:
            return library.appendingPathComponent("Components")
        case .vst3:
            return library.appendingPathComponent("VST3")
        case .clap:
            return library.appendingPathComponent("CLAP")
        case .lv2:
            return library.appendingPathComponent("LV2")
        case .vst2:
            return library.appendingPathComponent("VST")
        }
    }
}

/// A synthesizer plugin available for installation.
struct SynthPlugin: Identifiable, Hashable {
    let id: String
    let name: String
    let productID: String
    let emulatedHardware: String
    let description: String
    let availableFormats: [PluginFormat]
    let hasFXVariant: Bool

    /// Build the download URL for a given format and version.
    func downloadURL(format: PluginFormat, version: String, fx: Bool = false) -> URL {
        let product = fx ? "\(productID)FX" : productID
        let filename = "TheUsualSuspects-\(product)-\(format.rawValue)-\(version)-MacOS.zip"
        return URL(string: "https://github.com/dsp56300/gearmulator/releases/download/\(version)/\(filename)")!
    }
}

/// The catalog of all available synth plugins from The Usual Suspects.
struct SynthCatalog {
    static let currentVersion = "2.1.4"

    static let plugins: [SynthPlugin] = [
        SynthPlugin(
            id: "osirus",
            name: "Osirus",
            productID: "Osirus",
            emulatedHardware: "Access Virus A / B / C",
            description: "Emulazione del leggendario Access Virus, uno dei synth VA più iconici degli anni '90/2000.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: false
        ),
        SynthPlugin(
            id: "ostirus",
            name: "OsTIrus",
            productID: "OsTIrus",
            emulatedHardware: "Access Virus TI / TI2 / Snow",
            description: "Emulazione della serie Access Virus TI, evoluzione del Virus con integrazione Total Integration.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: true
        ),
        SynthPlugin(
            id: "vavra",
            name: "Vavra",
            productID: "Vavra",
            emulatedHardware: "Waldorf microQ",
            description: "Emulazione del Waldorf microQ, synth wavetable compatto con il suono caratteristico Waldorf.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: false
        ),
        SynthPlugin(
            id: "xenia",
            name: "Xenia",
            productID: "Xenia",
            emulatedHardware: "Waldorf Microwave II / XT",
            description: "Emulazione del Waldorf Microwave II/XT, il re della sintesi wavetable.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: false
        ),
        SynthPlugin(
            id: "nodalred2x",
            name: "Nodal Red 2x",
            productID: "NodalRed2x",
            emulatedHardware: "Clavia Nord Lead 2 / Rack 2x",
            description: "Emulazione del Nord Lead 2, il synth VA rosso per eccellenza, usatissimo in trance e techno.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: false
        ),
        SynthPlugin(
            id: "je8086",
            name: "JE-8086",
            productID: "JE8086",
            emulatedHardware: "Roland JP-8000 / JP-8080",
            description: "Emulazione del Roland JP-8000/8080, famoso per il suo Supersaw e i suoni trance classici.",
            availableFormats: [.au, .vst3, .clap, .lv2, .vst2],
            hasFXVariant: false
        ),
    ]
}
