"""
Copyright 2019 Windell H. Oskay, Evil Mad Scientist Laboratories


"""
from __future__ import print_function
import optparse

from lxml import etree

from pyaxidraw import hershey_conf
from pyaxidraw.hershey_options import common_options
from pyaxidraw.plot_utils_import import from_dependency_import # plotink

from . import utils

inkex = from_dependency_import('ink_extensions.inkex')

cli_version = "Hershey Advanced Command Line Interface v2.0.0"

quick_help = '''
    Hershey Text Advanced - CLI Interface.
    Provide a SVG file to be parsed.
    Usage: python hta.py [OPTIONS] INPUT [OUTPUT]
           or hta [OPTIONS] INPUT [OUTPUT]
    For a list of options, call hta --help
       or read htahelp.txt included with this distribution.'''

help_cmd = "hta --help"

def hta_CLI():

    parser = optparse.OptionParser(description=cli_version, option_class=inkex.InkOption, usage=quick_help)

    parser.add_option_group(
        common_options.core_options(parser, hershey_conf.__dict__))
    parser.add_option_group(
        common_options.extra_options(parser, hershey_conf.__dict__))

    flag_options, required_args = parser.parse_args()


    no_flag_arg = required_args.pop(0) if len(required_args) > 0 else None
    output_file = required_args.pop(0) if len(required_args) > 0 else None
    if len(required_args) != 0:
        print("There are too many arguments or the command is malformed. Try:")
        print("    {}".format(help_cmd))
        quit()
    utils.handle_info_cases(no_flag_arg, quick_help, cli_version)
    input_file = no_flag_arg
    utils.check_for_input(input_file, help_cmd)

    from pyaxidraw.hershey_advanced import HersheyAdv

    hta = HersheyAdv()
    hta.getoptions([])

    hta.parse(input_file)
    
    # if command line specified a config file, import it as a namespace

    flag_options.config = None  # No config file option at present
    config_file = utils.load_config(flag_options.config)

    option_names = ["fontface", "otherfont", "letter_spacing", 
                    "word_spacing", "enable_defects", "baseline_var", 
                    "indent_var", "kern_var",  "size_var", "sample_text", "util_mode",
                    "preserve_text", "rand_seed"]
    utils.assign_option_values(hta.options, flag_options, [config_file], option_names)
        
    hta.effect()    # Plot the document

    utils.output_result(output_file, etree.tostring(hta.document).decode("utf-8"))
