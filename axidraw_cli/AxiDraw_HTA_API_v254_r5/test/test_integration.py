import unittest

from mock import MagicMock

from pyaxidraw import axidraw_control
from pyaxidraw.axidraw_options import versions
from pyaxidraw import axidraw

# python -m unittest discover in top-level package dir

class IntegrationTestCase(unittest.TestCase):

    def test_preview(self):
        # prep
        adc = axidraw_control.AxiDrawWrapperClass()

        axidraw_control.axidraw.AxiDraw.serial_connect = MagicMock()
        axidraw_control.axidraw.AxiDraw.plot_document = MagicMock()

        # run
        adc.getoptions([])
        adc.options.preview = True

        adc.parseFile('test/assets/AxiDraw_trivial.svg')

        adc.effect()

        # test
        # with the preview option, serial connection should not be attempted
        axidraw_control.axidraw.AxiDraw.serial_connect.assert_not_called()
        self.assertTrue(len(axidraw_control.axidraw.AxiDraw.plot_document.mock_calls) > 0,
                        "Calls were made to simulate plotting.")

    def test_version_check(self):
        ''' connected to machine and internet '''
        ad = axidraw.AxiDraw()

        # mocks
        axidraw_control.axidraw.versions.get_versions_online = MagicMock(
            return_value=versions.Versions("10", "10", "10"))
        ad.plot_document = MagicMock()
        self._mock_AxiDraw_connection(ad)

        ad.getoptions([])
        ad.options.mode = "sysinfo"
        ad.parse('test/assets/AxiDraw_trivial.svg')

        ad.effect()

        self.assertEqual(len(axidraw_control.axidraw.versions.get_versions_online.mock_calls), 1,
                         "should query the 'internet' for version info")
        self.assertEqual(len(ad.plot_document.mock_calls), 0,
                         "does not do any plotting with sysinfo mode")

    def test_version_check_without_machine(self):
        ''' connected to internet but not machine '''
        adc = axidraw_control.AxiDrawWrapperClass()

        # mocks
        axidraw_control.axidraw.versions.get_versions_online = MagicMock(
            return_value=versions.Versions("0", "1", "2"))

        adc.getoptions([])
        adc.options.mode = "sysinfo"
        adc.parseFile('test/assets/AxiDraw_trivial.svg')

        adc.effect()

        self.assertEqual(len(axidraw_control.axidraw.versions.get_versions_online.mock_calls), 1)

    def test_version_check_without_internet(self):
        ''' connected to machine but not internet '''
        ad = axidraw.AxiDraw()

        self._mock_AxiDraw_connection(ad)
        axidraw.versions.get_versions_online = MagicMock(side_effect=RuntimeError("an error"))
        ad.error_log = MagicMock()

        ad.getoptions([])
        ad.options.mode = "sysinfo"
        ad.parse('test/assets/AxiDraw_trivial.svg')

        ad.effect()

        self.assertEqual(len(axidraw.versions.get_versions_online.mock_calls), 1,
                         "ensure mock was used")
        self.assertEqual(len(axidraw.versions.ebb_serial.queryVersion.mock_calls), 1,
                         "ensure mock was used")
        self.assertTrue(len(ad.error_log.mock_calls) > 0, "No Internet is an error")

    def _mock_AxiDraw_connection(self, axidraw_instance):
        axidraw.ebb_serial.openPort = MagicMock()
        axidraw.versions.ebb_serial.queryVersion = MagicMock(return_value="Firmware Version 9.9.9")
        axidraw_instance.serial_port = MagicMock()
