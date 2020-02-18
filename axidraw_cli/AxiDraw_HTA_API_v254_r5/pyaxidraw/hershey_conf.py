# hershey_conf.py
# Part of Hershey Advanced
#
# Copyright 2019, Windell H. Oskay, www.evilmadscientist.com
#
#
# "Change numbers here, not there." :)


'''
User-adjustable control parameters:

If you are operating the Hershey Text Advanced from within Inkscape 
 (either within the application from the Extensions menu or from the
 command line), please set your preferences within Inkscape, using
 the Hershey Text Advanced dialog under Extensions > Text.
 (The values listed here are ignored when called via Inkscape.)

If you are operating the AxiDraw in "standalone" mode, that is, outside
 of the Inkscape context, then please set your preferences here or via
 command-line arguments. (Preferences set within Inkscape -- via the 
 AxiDraw Control dialog -- are ignored when called via the command line.)
 We suggest adjusting and testing settings from within the Inkscape
 GUI, before moving to stand-alone control.
 
 
'''

preserve_text = False		# Preserve original text. True or False.

letter_spacing = 100		# Override letter spacing (percent).	Range: 50 - 400
word_spacing = 100		# Override word spacing (percent).		Range: 50 - 600

enable_defects = False	# Enable Handwriting Defects. True or False.

baseline_var = 15		# Variation in text baseline, when enableDefects is True (percent). Range: 0 - 100.
indent_var = 15			# Variation in indent, when enableDefects is True (percent). 		Range: 0 - 100.
kern_var = 15			# Variation in kerning, when enableDefects is True (percent). 		Range: 0 - 100.
size_var = 15			# Variation in font size, when enableDefects is True (percent). 	Range: 0 - 100.

rand_seed = 1				# Random Seed. If default value (1) is left in place, execution time will be used
						#    as the random seed. However, you can override this and provide your own seed
						#    in cases where it is necessary to use the same random seed repeatedly.

fontface = "HersheySans1"	# Default font face -- will be used if selected font face is not available.

# Scriptalizer support -- for use with Quantum Enterprises fonts:

script_enable = True    # Enable Scriptalizer use for use with compatible Quantum Enterprises fonts.
                        #   Use requires an active internet connection and applicable fonts.
                        #   Set to False to disable this feature.
                        #   Visit http://quantumenterprises.co.uk/slf to learn more about these fonts.
                        
script_mistakes = 0     # Rate of adding "mistakes" in the scriptalizer. Set to 0 to disable.

script_quiet = True     # If true, mute (quietly ignore) any errors encountered when accessing the Scriptalizer.
                        #   Set to False to report any errors encountered.