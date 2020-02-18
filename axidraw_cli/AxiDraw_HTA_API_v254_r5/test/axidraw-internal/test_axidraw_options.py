import unittest
import copy
import random

from pyaxidraw.axidraw_options.common_options import get_configured_value

from plot_utils_import import from_dependency_import

cspsubdiv = from_dependency_import('ink_extensions.cspsubdiv')

# python -m unittest discover in top-level package dir

class AxidrawOptionsTestCase(unittest.TestCase):
    
    def test_get_configured_value_no_configs(self):
        """ If no configs are provided, raise an error """
        with self.assertRaises(BaseException):
            get_configured_value("eggs", [])

    def test_get_configured_value_one_config(self):
        """ look in the config for the correct value """
        config = { "some": "values", "blah": "blue" }

        for attr, value in config.items():
            self.assertEqual(value, get_configured_value(attr, [config]))

    def test_get_configured_value_defined_anything(self):
        """ test case: two configs, and the attr is defined in both.
        The first config should get priority """
        user_config = { "true": True, "zero": 0, "num": 100, "string": "a string" }
        standard_config = { "true": "blap", "zero": 123, "num": "???" }

        for attr, value in user_config.items():
            self.assertEqual(value, get_configured_value(attr, [user_config, standard_config]))

    def test_get_configured_value_undefined_undefined(self):
        """ if the attr is not defined in any configs, raise an error """
        user_config = { "something": 23 }
        standard_config = { "another": "blah" }

        with self.assertRaises(BaseException):
            get_configured_value("something else entirely", [user_config, standard_config])

    def test_get_configured_value_none_anything(self):
        """ if the first config defines the attr as None, return None,
        no matter what the second config says """

        user_config = { "defined": None, "undefined": None }
        standard_config = { "defined": 1 }

        for attr, value in user_config.items():
            self.assertIsNone(get_configured_value(attr, [user_config, standard_config]))
