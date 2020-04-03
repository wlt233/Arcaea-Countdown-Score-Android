import lief

libcocos2dcpp = lief.parse("libcocos2dcpp.so")
libcocos2dcpp.add_library("libgadget.so") # Injection!
libcocos2dcpp.write("newlibcocos2dcpp.so")