/**
* @Project: Arcaea-Countdown-Score-Android
* @Filename: countdown.js
* @Author: wlt233
* @Time: 2020-04-04 22:35
* @License: MIT
* @Description: test on Arcaea version 2.6.0c
*/


/* Settings */
var ifScriptRun = true;           // The main switch of this script.

var ifCountDown = true;           // Choose whether use score countdown
var ifAddShinyPure = false;       // Choose score start from 10000000(true) or FPM(false)

var ifScoreBorder = true;         // Choose whether use combo to show score border points
var scoreBorder = 9800000;        // Set the goal border, the Shine Pure's 1 added score will not be calculate
                                  // A lost costs 2 point, a far costs 1 point

var ifOutput = false;             // Choose whether print log or not
                                  // View the log with: adb logcat -s "ArcaeaCountdown:V"
                                  // Notice: if this option is on, Arcaea will get stucked when you hit the first note 
                                  // after launched Arcaea because of the loading of android.util.Log
                                  // It will be OK then. Just try to replay the song


if (ifScriptRun) setTimeout(hook(), 500);

function hook() {
    var PTR;
    var ORGCOMBO = 0;
    var All = 114514;
    var BORDER;
    var songStart;

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN7ArcUtil14calculateScoreEiiiii"), {
        onEnter: function(args) {
            /* Not using
            var ALL, LOST, FAR, PURE, SHINEPURE, SCORE;
            LOST = parseInt(args[0],16); FAR = parseInt(args[1],16); PURE = parseInt(args[2],16); SHINEPURE = parseInt(args[3],16); ALL = parseInt(args[4],16);
            javaLog("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
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
            BORDER = Math.floor((10000000 - scoreBorder) / (5000000 / All));
            songStart = 1;
            if (ifCountDown) Memory.writeInt(PTR.add(0x10), SCORE);
            if (ifCountDown) Memory.writeInt(PTR.add(0x14), SCORE3);
            if (ifOutput) javaLog("Border " + BORDER.toString());
        }
    });

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN7UILayer8setComboEi"), {
        onEnter: function(args) {
            if (ifScoreBorder && songStart && !parseInt(args[1],16)) {
                args[1] = ptr(BORDER);
            }
        },
        onLeave:function(retval){}
    });

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN10ScoreState8missNoteEP9LogicNotei"), {
        onEnter: function(args) {
            PTR = args[0];
            if (ifScoreBorder) Memory.writeInt(PTR.add(0x1c), ORGCOMBO);
            songStart = 0;
        },
        onLeave:function(retval){
            var ALL = Memory.readInt(PTR.add(0x8));
            var MAXCOMBO = Memory.readInt(PTR.add(0xc));
            ORGCOMBO = Memory.readInt(PTR.add(0x1c));
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
            var NEWCOMBO = BORDER - LOST * 2 - FAR;
            if (NEWCOMBO < 0) NEWCOMBO = 0;
            if (ifCountDown) Memory.writeInt(PTR.add(0x10), SCORE);
            if (ifCountDown) Memory.writeInt(PTR.add(0x14), SCORE3);
            if (ifScoreBorder) Memory.writeInt(PTR.add(0x1c), NEWCOMBO);
            if (ifOutput) {
                javaLog("Miss!!   ptr " + PTR.toString());
                javaLog("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
                javaLog("Score " + SCORE.toString());
                javaLog("Maxcombo " + MAXCOMBO.toString() + " ;NewCombo " + NEWCOMBO.toString() + " ;OrgCombo " + ORGCOMBO.toString());
                javaLog(hexdump(Memory.readByteArray(PTR, 0x30), {offset: 0, length: 0x30, header: false, ansi: false}));
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libcocos2dcpp.so" , "_ZN10ScoreState7hitNoteEP9LogicNote15HitAccuracyType13LateEarlyTypei"), {
        onEnter: function(args) {
            PTR = args[0];
            if (ifScoreBorder) Memory.writeInt(PTR.add(0x1c), ORGCOMBO);
            songStart = 0;
        },
        onLeave:function(retval){
            var ALL = Memory.readInt(PTR.add(0x8));
            var MAXCOMBO = Memory.readInt(PTR.add(0xc));
            ORGCOMBO = Memory.readInt(PTR.add(0x1c));
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
            var NEWCOMBO = BORDER - LOST * 2 - FAR;
            if (NEWCOMBO < 0) NEWCOMBO = 0;
            if (ifCountDown) Memory.writeInt(PTR.add(0x10), SCORE);
            if (ifCountDown) Memory.writeInt(PTR.add(0x14), SCORE3);
            if (ifScoreBorder) Memory.writeInt(PTR.add(0x1c), NEWCOMBO);
            if (ifOutput) {
                javaLog("Hit !!   ptr " + PTR.toString());
                javaLog("Lost " + LOST.toString() + "; Far " + FAR.toString() + "; Pure " + PURE.toString() + "; ShinyPure " + SHINEPURE.toString() + "; All " + ALL.toString());
                javaLog("Score " + SCORE.toString());
                javaLog("Maxcombo " + MAXCOMBO.toString() + " ;NewCombo " + NEWCOMBO.toString() + " ;OrgCombo " + ORGCOMBO.toString());
                javaLog(hexdump(Memory.readByteArray(PTR, 0x30), {offset: 0, length: 0x30, header: false, ansi: false}));
            }
        }
    }); 
}

function javaLog(payload){
    Java.perform(function () {
        var Log = Java.use("android.util.Log");
        Log.v("ArcaeaCountdown", payload);
    });
}
