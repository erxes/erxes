//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var SHA256;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/sha/sha256.js                                                                                     //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
/// METEOR WRAPPER                                                                                            // 1
//                                                                                                            // 2
SHA256 = (function () {                                                                                       // 3
                                                                                                              // 4
                                                                                                              // 5
/**                                                                                                           // 6
*                                                                                                             // 7
*  Secure Hash Algorithm (SHA256)                                                                             // 8
*  http://www.webtoolkit.info/javascript-sha256.html                                                          // 9
*  http://anmar.eu.org/projects/jssha2/                                                                       // 10
*                                                                                                             // 11
*  Original code by Angel Marin, Paul Johnston.                                                               // 12
*                                                                                                             // 13
**/                                                                                                           // 14
                                                                                                              // 15
function SHA256(s){                                                                                           // 16
                                                                                                              // 17
	var chrsz   = 8;                                                                                             // 18
	var hexcase = 0;                                                                                             // 19
                                                                                                              // 20
	function safe_add (x, y) {                                                                                   // 21
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);                                                                      // 22
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);                                                              // 23
		return (msw << 16) | (lsw & 0xFFFF);                                                                        // 24
	}                                                                                                            // 25
                                                                                                              // 26
	function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }                                                  // 27
	function R (X, n) { return ( X >>> n ); }                                                                    // 28
	function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }                                                      // 29
	function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }                                              // 30
	function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }                                            // 31
	function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }                                            // 32
	function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }                                             // 33
	function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }                                           // 34
                                                                                                              // 35
	function core_sha256 (m, l) {                                                                                // 36
		var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
		var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);                                                                                      // 39
		var a, b, c, d, e, f, g, h, i, j;                                                                           // 40
		var T1, T2;                                                                                                 // 41
                                                                                                              // 42
		m[l >> 5] |= 0x80 << (24 - l % 32);                                                                         // 43
		m[((l + 64 >> 9) << 4) + 15] = l;                                                                           // 44
                                                                                                              // 45
		for ( var i = 0; i<m.length; i+=16 ) {                                                                      // 46
			a = HASH[0];                                                                                               // 47
			b = HASH[1];                                                                                               // 48
			c = HASH[2];                                                                                               // 49
			d = HASH[3];                                                                                               // 50
			e = HASH[4];                                                                                               // 51
			f = HASH[5];                                                                                               // 52
			g = HASH[6];                                                                                               // 53
			h = HASH[7];                                                                                               // 54
                                                                                                              // 55
			for ( var j = 0; j<64; j++) {                                                                              // 56
				if (j < 16) W[j] = m[j + i];                                                                              // 57
				else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                                                                                                              // 59
				T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);                    // 60
				T2 = safe_add(Sigma0256(a), Maj(a, b, c));                                                                // 61
                                                                                                              // 62
				h = g;                                                                                                    // 63
				g = f;                                                                                                    // 64
				f = e;                                                                                                    // 65
				e = safe_add(d, T1);                                                                                      // 66
				d = c;                                                                                                    // 67
				c = b;                                                                                                    // 68
				b = a;                                                                                                    // 69
				a = safe_add(T1, T2);                                                                                     // 70
			}                                                                                                          // 71
                                                                                                              // 72
			HASH[0] = safe_add(a, HASH[0]);                                                                            // 73
			HASH[1] = safe_add(b, HASH[1]);                                                                            // 74
			HASH[2] = safe_add(c, HASH[2]);                                                                            // 75
			HASH[3] = safe_add(d, HASH[3]);                                                                            // 76
			HASH[4] = safe_add(e, HASH[4]);                                                                            // 77
			HASH[5] = safe_add(f, HASH[5]);                                                                            // 78
			HASH[6] = safe_add(g, HASH[6]);                                                                            // 79
			HASH[7] = safe_add(h, HASH[7]);                                                                            // 80
		}                                                                                                           // 81
		return HASH;                                                                                                // 82
	}                                                                                                            // 83
                                                                                                              // 84
	function str2binb (str) {                                                                                    // 85
		var bin = Array();                                                                                          // 86
		var mask = (1 << chrsz) - 1;                                                                                // 87
		for(var i = 0; i < str.length * chrsz; i += chrsz) {                                                        // 88
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);                                            // 89
		}                                                                                                           // 90
		return bin;                                                                                                 // 91
	}                                                                                                            // 92
                                                                                                              // 93
	function Utf8Encode(string) {                                                                                // 94
		// METEOR change:                                                                                           // 95
		// The webtoolkit.info version of this code added this                                                      // 96
		// Utf8Encode function (which does seem necessary for dealing                                               // 97
		// with arbitrary Unicode), but the following line seems                                                    // 98
		// problematic:                                                                                             // 99
		//                                                                                                          // 100
		// string = string.replace(/\r\n/g,"\n");                                                                   // 101
		var utftext = "";                                                                                           // 102
                                                                                                              // 103
		for (var n = 0; n < string.length; n++) {                                                                   // 104
                                                                                                              // 105
			var c = string.charCodeAt(n);                                                                              // 106
                                                                                                              // 107
			if (c < 128) {                                                                                             // 108
				utftext += String.fromCharCode(c);                                                                        // 109
			}                                                                                                          // 110
			else if((c > 127) && (c < 2048)) {                                                                         // 111
				utftext += String.fromCharCode((c >> 6) | 192);                                                           // 112
				utftext += String.fromCharCode((c & 63) | 128);                                                           // 113
			}                                                                                                          // 114
			else {                                                                                                     // 115
				utftext += String.fromCharCode((c >> 12) | 224);                                                          // 116
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);                                                    // 117
				utftext += String.fromCharCode((c & 63) | 128);                                                           // 118
			}                                                                                                          // 119
                                                                                                              // 120
		}                                                                                                           // 121
                                                                                                              // 122
		return utftext;                                                                                             // 123
	}                                                                                                            // 124
                                                                                                              // 125
	function binb2hex (binarray) {                                                                               // 126
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";                                            // 127
		var str = "";                                                                                               // 128
		for(var i = 0; i < binarray.length * 4; i++) {                                                              // 129
			str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +                                         // 130
			hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);                                                 // 131
		}                                                                                                           // 132
		return str;                                                                                                 // 133
	}                                                                                                            // 134
                                                                                                              // 135
	s = Utf8Encode(s);                                                                                           // 136
	return binb2hex(core_sha256(str2binb(s), s.length * chrsz));                                                 // 137
                                                                                                              // 138
}                                                                                                             // 139
                                                                                                              // 140
/// METEOR WRAPPER                                                                                            // 141
return SHA256;                                                                                                // 142
})();                                                                                                         // 143
                                                                                                              // 144
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.sha = {}, {
  SHA256: SHA256
});

})();
