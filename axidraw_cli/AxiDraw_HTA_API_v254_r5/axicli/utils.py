from __future__ import print_function
import os
import sys
import runpy

def handle_info_cases(no_flag_arg, quick_help, cli_version, axidraw_version = None):
    ''' handles the simple cases like "version" and "help" '''

    if no_flag_arg == "help":
        print(cli_version)
        print(main_text)
        quit()

    if no_flag_arg == "version":
        print (cli_version)
        if axidraw_version is not None:
            print (axidraw_version)
        quit()

def check_for_input(input_file, help_cmd):
    ''' Check for the required input file, quit if not there. '''
    if (input_file is None) or (not os.path.isfile(input_file)):
        print("Input file required but not found. For help, try:")
        print("    {}".format(help_cmd))
        quit()

def output_result(output_file, result):
    ''' if an output file is is specified, write to it, else write to stdout. '''
    if output_file:
        with open(output_file, 'w') as out: # Open output file for writing
            out.write(result)
    else:
        sys.stdout.write(result)

def load_config(config):
    try:
        return runpy.run_path(config) if config is not None else {}
    except FileNotFoundError:
        print("Could not find any file named {}.".format(config))
        print("Check the spelling and/or location.")
        quit()
    except SyntaxError as e:
        print("Config file {} contains a syntax error on line {}:".format(e.filename, e.lineno))
        print("    {}".format(e.text))
        print("The config file should be a python file (*.py).")
        quit()

def assign_option_values(options_obj, command_line, configs, option_names):
    """ `configs` is a list of dicts containing values for the options, in order of priority.
    See get_configured_value.
    `command_line` is the return value of argparse.ArgumentParser.parse_args() or similar
    `options_obj` is the object that will be populated with the final option values.
    """

    for name in option_names:
        # argparse.ArgumentParser.parse_args() assigns None to any options that were
        # not defined by the user, so command line arguments are handled differently from
        # configured values (which might be correctly assigned None)
        command_line_value = getattr(command_line, name, None)
        if command_line_value is not None:
            setattr(options_obj, name, command_line_value)
        else:
            setattr(options_obj, name, get_configured_value(name, configs + [options_obj.__dict__]))

def get_configured_value(attr, configs):
    """ configs is a list of configuration dicts, in order of priority.

    e.g. if configs is a list [user_config, other_config], then the default for "speed_pendown" will be user_config.speed_pendown if user_config.speed_pendown exists, and if not, the default will be other_config.speed_pendown.
    """
    for config in configs:
        if attr in config:
            return config[attr]
    raise ValueError("The given attr ({}) was not found in any of the configurations.".format(attr))
