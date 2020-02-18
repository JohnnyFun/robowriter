#!/usr/bin/env python
# -*- encoding: utf-8 -#-

'''
hta.py

This script runs Hershey Text Advanced from the command line interface,
which replaces fonts within the SVG document with single-stroke text
in chosen styles.


This standalone script based in part on Ink2Canvas.

In case of unexpected plotting output, preview your SVG document in Inkscape.

'''

from axicli.hta_cli import hta_CLI

if __name__ == '__main__':
    hta_CLI()
