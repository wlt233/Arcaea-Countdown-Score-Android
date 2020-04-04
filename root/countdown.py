"""
/**
* @Project: Arcaea-Countdown-Score-Android
* @Filename: countdown.py
* @Author: wlt233
* @Time: 2020-04-04 09:54
* @License: MIT
* @Description: test on Arcaea version 2.6.0c
*/
"""
import frida
import sys


script = """

/* Settings */
var ifOutput = true;             // Choose whether print log or not
var ifAddShinyPure = false;       // Choose start from 10000000(true) or FPM(false)


var hasHooked = false;
Interceptor.attach(Module.findExportByName(null , "dlopen"), {
    onEnter: function(args) {
        this.path = Memory.readUtf8String(args[0])
        if (ifOutput) send("Loading " + this.path);
    },
    onLeave:function(retval){
        if(!retval.isNull() && this.path.indexOf('libcocos2dcpp.so')!== -1 && !hasHooked){
            hasHooked = true;
            if (ifOutput) send("Hooking libcocos2dcpp.so!!");
            hook();
        }
    }
});

function hook(){

    var PTR;
    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN10ScoreState8missNoteEP9LogicNotei"), {
        onEnter: function(args) {
            PTR = args[0];
        },
        onLeave:function(retval){
            var ALL = Memory.readInt(PTR.add(0x8));
            var SHINEPURE = Memory.readInt(PTR.add(0x20));
            var PURE = Memory.readInt(PTR.add(0x24));
            var FAR = Memory.readInt(PTR.add(0x28));
            var LOST = Memory.readInt(PTR.add(0x2c));
            var SCORE;
            if (ifAddShinyPure) {
                SCORE = 10000000 + SHINEPURE - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
            } else {
                SCORE = 10000000 + ALL  - (PURE - SHINEPURE + FAR + LOST) - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
            }
            var SCORE3 = Math.floor(SCORE / 3);
            Memory.writeInt(PTR.add(0x10), SCORE);
            Memory.writeInt(PTR.add(0x14), SCORE3);
            if (ifOutput) {
                send("Miss!!");
                send(PTR);
                send("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
                send("Score " + SCORE.toString());
                console.log(hexdump(Memory.readByteArray(PTR, 0x30), {
                    offset: 0,
                    length: 0x30,
                    header: false,
                    ansi: false
                }));
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN10ScoreState7hitNoteEP9LogicNote15HitAccuracyType13LateEarlyTypei"), {
        onEnter: function(args) {
            PTR = args[0]; 
        },
        onLeave:function(retval){
            var ALL = Memory.readInt(PTR.add(0x8));
            var SHINEPURE = Memory.readInt(PTR.add(0x20));
            var PURE = Memory.readInt(PTR.add(0x24));
            var FAR = Memory.readInt(PTR.add(0x28));
            var LOST = Memory.readInt(PTR.add(0x2c));
            var SCORE;
            if (ifAddShinyPure) {
                SCORE = 10000000 + SHINEPURE - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
            } else {
                SCORE = 10000000 + ALL  - (PURE - SHINEPURE + FAR + LOST) - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
            }
            var SCORE3 = Math.floor(SCORE / 3);
            Memory.writeInt(PTR.add(0x10), SCORE);
            Memory.writeInt(PTR.add(0x14), SCORE3);
            if (ifOutput) {
                send("Hit !!");
                send(PTR);
                send("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
                send("Score " + SCORE.toString());
                console.log(hexdump(Memory.readByteArray(PTR, 0x30), {
                    offset: 0,
                    length: 0x30,
                    header: false,
                    ansi: false
                }));
            }
        }
    });

    var All;
    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN7ArcUtil14calculateScoreEiiiii"), {
        onEnter: function(args) {
            /* Not using
            var ALL, LOST, FAR, PURE, SHINEPURE, SCORE;
            LOST = parseInt(args[0],16); FAR = parseInt(args[1],16); PURE = parseInt(args[2],16); SHINEPURE = parseInt(args[3],16); ALL = parseInt(args[4],16);
            send("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
            */
            All = parseInt(args[4],16);
        },
        onLeave:function(retval){   
        }
    });

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN10ScoreStateC2Ev"), {
        onEnter: function(args) {
            PTR = args[0];
        },
        onLeave:function(retval){
            var SCORE
            if (ifAddShinyPure) {
                SCORE = 10000000;
            } else {
                SCORE = 10000000 + All;
            }
            var SCORE3 = Math.floor(SCORE / 3);
            Memory.writeInt(PTR.add(0x10), SCORE);
            Memory.writeInt(PTR.add(0x14), SCORE3);
        }
    });
}
"""

if __name__ == "__main__":
    device = frida.get_usb_device(timeout=1000)
    pid = device.spawn(["moe.low.arc"])
    session = device.attach(pid)
    device.resume(pid)
    print("Arcaea start running!! pid = %d"%pid)
    script = session.create_script(script)
    def on_message(message ,data):
        if message["type"] == "send":
            print(message["payload"])
        else:
            print(message)
    script.on("message" , on_message)
    script.load()
    sys.stdin.read()
