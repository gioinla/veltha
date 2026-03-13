#!/usr/bin/env python3
"""
Current Affairs Random Analysis Engine

A CLI tool that produces fresh, randomized interpretations of current global
affairs using different analytical lenses, structures, and tones each time.

Usage:
    python current_affairs_analyzer.py          # Generate one analysis
    python current_affairs_analyzer.py --loop   # Interactive mode: type 'again' for more
"""

import random
import textwrap
from datetime import datetime

ANALYTICAL_LENSES = [
    "geopolitical_power_dynamics",
    "economic_systems_and_market_shifts",
    "cultural_and_social_psychology",
    "technological_acceleration_and_ai",
    "ecological_and_planetary_systems",
    "historical_parallels",
    "media_narratives_and_propaganda",
    "generational_demographic_forces",
    "moral_philosophical_interpretation",
    "emergent_systems_theory",
]

TONES = [
    "academic",
    "journalistic",
    "conspiratorial",
    "philosophical",
    "satirical",
    "cinematic",
]

STRUCTURES = [
    "bullet_breakdown",
    "short_essay",
    "numbered_thesis",
    "narrative_scenario",
    "intelligence_briefing",
]

# Pool of current events and trends to sample from (2025-2026 era)
CURRENT_EVENTS = [
    "AI systems reaching autonomous agent capabilities and reshaping labor markets",
    "Escalating great-power competition between the US and China over semiconductors",
    "Global debt levels reaching unprecedented highs across developed economies",
    "Climate-driven migration accelerating across the Global South",
    "The rise of multipolar currency systems challenging dollar hegemony",
    "Social media fragmentation into ideologically siloed platforms",
    "Declining birth rates across East Asia and Southern Europe",
    "Renewed nuclear energy investment as part of decarbonization strategies",
    "Growing resistance to AI surveillance in democratic societies",
    "Central bank digital currencies rolling out across multiple nations",
    "Water scarcity conflicts intensifying in the Middle East and North Africa",
    "Reshoring of manufacturing supply chains from Asia to the Americas",
    "Deepfake technology undermining electoral integrity worldwide",
    "Space commercialization accelerating with private lunar missions",
    "Antibiotic resistance emerging as a slow-moving pandemic threat",
    "Youth mental health crisis deepening in screen-saturated societies",
    "Agricultural disruption from lab-grown proteins and vertical farming",
    "Rising authoritarian movements exploiting democratic institutional fatigue",
    "Quantum computing breakthroughs threatening current encryption standards",
    "Indigenous land-rights movements gaining legal ground in Latin America",
    "The hollowing out of mid-tier journalism and local news ecosystems",
    "Global rare-earth mineral competition driving new geopolitical alliances",
    "Autonomous weapons development outpacing international treaty frameworks",
    "Remote work reshaping urban geography and real estate markets",
]

# Unexpected cross-domain connections
CROSS_DOMAIN_CONNECTIONS = [
    (
        "declining birth rates",
        "AI labor automation",
        "The demographic collapse and the rise of machine labor are not separate crises "
        "but a single systemic transition — humanity is simultaneously producing fewer "
        "workers and making workers less necessary.",
    ),
    (
        "deepfake technology",
        "water scarcity",
        "Both represent a crisis of trust in what was once taken for granted: the "
        "reliability of what we see and the availability of what we drink.",
    ),
    (
        "space commercialization",
        "antibiotic resistance",
        "We are racing to colonize new worlds while losing the ability to defend the "
        "biological one — our ambitions expand outward as our immune defenses contract.",
    ),
    (
        "nuclear energy revival",
        "social media fragmentation",
        "Both phenomena share a common root: the failure of decentralized systems "
        "(renewables, open platforms) to deliver on their utopian promises, driving "
        "a reluctant return to centralized control.",
    ),
    (
        "quantum computing",
        "indigenous land rights",
        "The oldest claims to sovereignty and the newest computational paradigms both "
        "challenge the Enlightenment-era boundaries of property and knowledge.",
    ),
    (
        "youth mental health crisis",
        "reshoring of supply chains",
        "The desire to bring things closer — production back home, attention back to "
        "the immediate — is the same impulse: a civilization recoiling from the vertigo "
        "of hyper-globalization.",
    ),
    (
        "central bank digital currencies",
        "climate migration",
        "The digitization of money and the displacement of peoples are converging: "
        "future refugees may carry their entire economic identity in a wallet that "
        "no border agent can confiscate.",
    ),
    (
        "lab-grown proteins",
        "autonomous weapons",
        "We are learning to grow meat without animals and wage war without soldiers — "
        "in both cases, removing the living body from processes that once required it.",
    ),
    (
        "great-power semiconductor competition",
        "media narrative collapse",
        "The fight over who manufactures chips and who controls stories are the same "
        "war: both are battles over the substrate of reality.",
    ),
    (
        "rare-earth mineral competition",
        "remote work",
        "The physical and the virtual economies are pulling in opposite directions — "
        "we need more minerals from specific places while needing fewer people in "
        "specific places.",
    ),
]


def select_events(count=None):
    """Select a random subset of current events."""
    if count is None:
        count = random.randint(3, 6)
    return random.sample(CURRENT_EVENTS, count)


def select_lens(previous_lens=None):
    """Select a random analytical lens, avoiding the previous one."""
    available = [l for l in ANALYTICAL_LENSES if l != previous_lens]
    return random.choice(available)


def select_tone():
    """Select a random tone."""
    return random.choice(TONES)


def select_structure():
    """Select a random structure."""
    return random.choice(STRUCTURES)


def select_connection():
    """Select a random cross-domain connection."""
    return random.choice(CROSS_DOMAIN_CONNECTIONS)


def lens_label(lens):
    """Human-readable label for a lens."""
    return lens.replace("_", " ").title()


def tone_label(tone):
    """Human-readable label for a tone."""
    return tone.replace("_", " ").title()


def structure_label(structure):
    """Human-readable label for a structure."""
    return structure.replace("_", " ").title()


def format_bullet_breakdown(title, events, lens, connection, prediction):
    """Format analysis as bullet breakdown."""
    lines = [title, ""]
    lines.append(f"Analytical Lens: {lens_label(lens)}")
    lines.append("")
    lines.append("Key developments:")
    for event in events:
        lines.append(f"  * {event}")
    lines.append("")
    lines.append("Cross-domain link:")
    lines.append(f"  [{connection[0]} <-> {connection[1]}]")
    lines.append(f"  {connection[2]}")
    lines.append("")
    lines.append("Speculative forecast:")
    lines.append(f"  >> {prediction}")
    return "\n".join(lines)


def format_short_essay(title, events, lens, connection, prediction):
    """Format analysis as a short essay."""
    paragraphs = [title, ""]

    intro = (
        f"Viewed through the lens of {lens_label(lens).lower()}, the current "
        f"global landscape reveals patterns that conventional analysis overlooks. "
        f"Consider the following convergence of forces."
    )
    paragraphs.append(textwrap.fill(intro, width=78))
    paragraphs.append("")

    body = " ".join(
        f"We see {event.lower()}." for event in events
    )
    body += (
        f" These are not isolated phenomena. They form a coherent signal when "
        f"read together."
    )
    paragraphs.append(textwrap.fill(body, width=78))
    paragraphs.append("")

    bridge = (
        f"Perhaps most revealing is the unlikely link between {connection[0]} "
        f"and {connection[1]}. {connection[2]}"
    )
    paragraphs.append(textwrap.fill(bridge, width=78))
    paragraphs.append("")

    close = f"Where does this leave us? {prediction}"
    paragraphs.append(textwrap.fill(close, width=78))

    return "\n".join(paragraphs)


def format_numbered_thesis(title, events, lens, connection, prediction):
    """Format analysis as numbered thesis points."""
    lines = [title, ""]
    lines.append(f"Framework: {lens_label(lens)}")
    lines.append("-" * 40)
    lines.append("")

    for i, event in enumerate(events, 1):
        lines.append(f"  {i}. {event}")
    lines.append("")

    lines.append(f"  {len(events) + 1}. CROSS-DOMAIN THESIS: The intersection of "
                 f"{connection[0]} and {connection[1]} reveals a deeper pattern:")
    lines.append(f"     {connection[2]}")
    lines.append("")

    lines.append(f"  {len(events) + 2}. PREDICTION: {prediction}")

    return "\n".join(lines)


def format_narrative_scenario(title, events, lens, connection, prediction):
    """Format analysis as a narrative scenario."""
    lines = [title, ""]
    year = datetime.now().year + random.randint(1, 5)
    month = random.choice([
        "January", "March", "June", "September", "November"
    ])

    lines.append(f"  {month} {year}.")
    lines.append("")

    narrator = (
        f"  The analysts had seen the pieces moving for years. "
        f"{events[0]}. {events[1]}. "
        f"Each trend appeared manageable in isolation."
    )
    lines.append(textwrap.fill(narrator, width=78))
    lines.append("")

    if len(events) > 2:
        middle = "  But then came the convergence. " + " Meanwhile, ".join(
            event.lower() for event in events[2:]
        ) + "."
        lines.append(textwrap.fill(middle, width=78))
        lines.append("")

    twist = (
        f"  What no one had mapped was the link between {connection[0]} "
        f"and {connection[1]}. {connection[2]}"
    )
    lines.append(textwrap.fill(twist, width=78))
    lines.append("")

    ending = f"  And so the world tilted. {prediction}"
    lines.append(textwrap.fill(ending, width=78))

    return "\n".join(lines)


def format_intelligence_briefing(title, events, lens, connection, prediction):
    """Format analysis as an intelligence briefing."""
    lines = [title, ""]
    lines.append(f"DATE:           {datetime.now().strftime('%Y-%m-%d')}")
    lines.append(f"CLASSIFICATION: OPEN SOURCE")
    lines.append(f"FRAMEWORK:      {lens_label(lens).upper()}")
    lines.append(f"CONFIDENCE:     MODERATE-HIGH")
    lines.append("")
    lines.append("SITUATION SUMMARY:")
    for i, event in enumerate(events, 1):
        lines.append(f"  [{i}] {event}")
    lines.append("")
    lines.append("CROSS-DOMAIN INDICATOR:")
    lines.append(f"  Correlation detected between {connection[0].upper()} "
                 f"and {connection[1].upper()}.")
    lines.append(f"  Assessment: {connection[2]}")
    lines.append("")
    lines.append("FORECAST:")
    lines.append(f"  {prediction}")

    return "\n".join(lines)


FORMATTERS = {
    "bullet_breakdown": format_bullet_breakdown,
    "short_essay": format_short_essay,
    "numbered_thesis": format_numbered_thesis,
    "narrative_scenario": format_narrative_scenario,
    "intelligence_briefing": format_intelligence_briefing,
}

# Predictions pool
PREDICTIONS = [
    "By the end of the decade, the concept of a 'national economy' will be as "
    "quaint as the concept of a 'national internet' — technically possible but "
    "practically meaningless.",

    "The next major geopolitical conflict will not be fought over territory but "
    "over computational sovereignty — who controls the training data, the models, "
    "and the inference infrastructure.",

    "We are entering an era where the most powerful political actors are not "
    "states or corporations but narrative ecosystems — self-reinforcing loops of "
    "belief that operate beyond any single institution's control.",

    "Within five years, a climate-driven migration event will force a fundamental "
    "renegotiation of the international refugee framework, likely breaking it "
    "entirely before something new emerges.",

    "The greatest risk of the next decade is not any single catastrophe but the "
    "slow erosion of institutional capacity to respond to any catastrophe at all.",

    "A new form of political identity is emerging — not left or right, not "
    "national or global, but defined by one's relationship to algorithmic systems: "
    "those who shape them, those shaped by them, and those who refuse them.",

    "The current economic order will not collapse dramatically but will quietly "
    "hollow out, replaced by parallel systems that most people won't notice until "
    "the old one is already gone.",

    "The defining technology of the 2030s will not be AI itself but the social "
    "and legal infrastructure built to contain it — and the inevitable gaps in "
    "that containment.",

    "History suggests that periods of rapid technological change combined with "
    "institutional sclerosis produce not revolution but a long, disorienting "
    "interregnum — we are entering one now.",

    "The next great philosophical movement will emerge not from universities but "
    "from the collision between ecological limits and technological abundance — "
    "a forced reckoning with what 'enough' means.",
]

# Tone modifiers applied to the title
TONE_TITLES = {
    "academic": "ANALYTICAL FRAMEWORK: Global Systems Assessment",
    "journalistic": "DISPATCH: What the World Looks Like Right Now",
    "conspiratorial": "PATTERN RECOGNITION: What They Don't Want Connected",
    "philosophical": "MEDITATION: On the Shape of the Present Moment",
    "satirical": "TOTALLY NORMAL BRIEFING: Everything Is Fine, Probably",
    "cinematic": "ACT III: The World at a Turning Point",
}


def generate_analysis(previous_lens=None):
    """Generate a complete randomized analysis."""
    lens = select_lens(previous_lens)
    tone = select_tone()
    structure = select_structure()
    events = select_events()
    connection = select_connection()
    prediction = random.choice(PREDICTIONS)

    title = TONE_TITLES.get(tone, "ANALYSIS")

    formatter = FORMATTERS[structure]
    output = formatter(title, events, lens, connection, prediction)

    metadata = (
        f"\n{'=' * 60}\n"
        f"[lens: {lens_label(lens)} | tone: {tone_label(tone)} | "
        f"structure: {structure_label(structure)}]\n"
        f"{'=' * 60}"
    )

    return output + "\n" + metadata, lens


def main():
    import sys

    print("=" * 60)
    print("  CURRENT AFFAIRS RANDOM ANALYSIS ENGINE")
    print("  Type 'again', 'another', or 'a' for a new analysis.")
    print("  Type 'quit' or 'q' to exit.")
    print("=" * 60)
    print()

    previous_lens = None
    analysis, previous_lens = generate_analysis(previous_lens)
    print(analysis)
    print()

    if "--loop" not in sys.argv and len(sys.argv) <= 1:
        # Single-shot mode: just print one and exit
        return

    while True:
        try:
            user_input = input("\n> ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if user_input in ("quit", "q", "exit"):
            print("Exiting.")
            break
        elif user_input in ("again", "another", "a", "do it again", ""):
            print()
            analysis, previous_lens = generate_analysis(previous_lens)
            print(analysis)
            print()
        else:
            print("Type 'again' for a new analysis or 'quit' to exit.")


if __name__ == "__main__":
    main()
