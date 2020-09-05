er = function(a, b) {
	for (var c = 0; c < b.length - 2; c += 3) {
		var d = b.charAt(c + 2);
		d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
		d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
		a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
	}
	return a
}

a='this is a word'
b=window.TKK
d = b.split(".");
b = Number(d[0]) || 0;
for (var e = [], f = 0, g = 0; g < a.length; g++) {
	var l = a.charCodeAt(g);
	128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
				e[f++] = l >> 18 | 240,
				e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
			e[f++] = l >> 6 & 63 | 128),
		e[f++] = l & 63 | 128)
}
a = b;
for (f = 0; f < e.length; f++)
	a += e[f],
	a = er(a, "+-a^+6");
a = er(a, "+-3^+b+-f");
a ^= Number(d[1]) || 0;
0 > a && (a = (a & 2147483647) + 2147483648);
a %= 1E6;
(a.toString() + "." + (a ^ b))



url='https://translate.google.com/translate_a/single?client=t&sl=en&tl=zh-CN&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&source=btn&ssel=0&tsel=0&kc=0&tk=604402.1001163&q=free'


