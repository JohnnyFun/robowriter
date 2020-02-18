from optparse import OptionGroup

def core_options(parser, config):
    options = OptionGroup(parser, "Core Options")

    options.add_option( "--fontface", \
        action="store", type="string", dest="fontface", \
        default=config["fontface"], \
        help="The selected font face when Apply was pressed" )

    options.add_option( "--otherfont", \
        action="store", type="string", dest="otherfont", \
        default=config["fontface"], \
        help="Optional other font name or path to use" )

    options.add_option( "--letterSpacing", \
        action="store", type="int", dest="letter_spacing", \
        default=config["letter_spacing"], \
        help="Override letter spacing " )

    options.add_option( "--wordSpacing", \
        action="store", type="int", dest="word_spacing", \
        default=config["word_spacing"], \
        help="Override word spacing " )

    options.add_option( "--enableDefects", \
        action="store", type="inkbool", dest="enable_defects", \
        default=config["enable_defects"], \
        help="Enable Handwriting Defects (true or false)")

    options.add_option( "--baselineVar", \
        action="store", type="int", dest="baseline_var", \
        default=config["baseline_var"], \
        help="Variation in baseline Jitter" )

    options.add_option( "--indentVar", \
        action="store", type="int", dest="indent_var", \
        default=config["indent_var"], \
        help="Variation in indent " )

    options.add_option( "--kernVar", \
        action="store", type="int", dest="kern_var", \
        default=config["kern_var"], \
        help="Variation in letter kerning " )

    options.add_option( "--sizeVar", \
        action="store", type="int", dest="size_var", \
        default=config["size_var"], \
        help="Variation in font size " )

    return options

def extra_options(parser, config):
    options = OptionGroup(parser, "Additional Options")

    options.add_option("--text",\
        type="string", action="store", dest="sample_text",\
        default="sample",
        help="Text to use for font table")
    
    options.add_option("--action",\
        type="string", action="store", dest="util_mode",\
        default="sample",
        help="The utility option selected")

    options.add_option("--preserve", \
        action="store", type="inkbool", dest="preserve_text", \
        default=config["preserve_text"], \
        help="Preserve original text (true or false)")

    options.add_option("--rSeed", \
        action="store", type="int", dest="rand_seed",
        default=config["rand_seed"],
        help="Random seed. Choose 1 to use time.")

    return options
