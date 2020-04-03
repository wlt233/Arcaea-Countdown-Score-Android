/**
* @Project: A
*
*
*/


/* Settings */
var ifCountDown = true;           // Choose whether use score countdown
var ifAddShinyPure = false;       // Choose score start from 10000000(true) or FPM(false)
var ifOutput = true;              // Choose whether print log or not


if (ifCountDown) setTimeout(hook(), 500);

function hook() {
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
                SCORE = 10000000 + ALL + SHINEPURE - PURE - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
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
                SCORE = 10000000 + ALL + SHINEPURE - PURE - Math.floor((1000000000 * (5 * FAR + 10 * LOST) / ALL + 999) / 1000);
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


