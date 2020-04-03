"""
/**
* @Project: Arcaea-Countdown-Score-Android
* @Filename: runLief.py
* @Author: wlt233
* @Time: 2020-04-04 03:55
* @License: MIT
*/
"""

import lief

libcocos2dcpp = lief.parse("libcocos2dcpp.so")
libcocos2dcpp.add_library("libgadget.so") # Injection!
libcocos2dcpp.write("newlibcocos2dcpp.so")