import itertools

codeHash = 0x6bca38432e686d0a2ab98d1cab5f21998075ffef811b6bb03d52812fa9a8f752

options = []

for i in range(32):
	options.append((codeHash >> (8 * i)) & 0xFF)

c = None
for combo in itertools.combinations(options[1:-1], 0x11):
	s = 0
	for e in combo:
		s += e
	if s % 0x539 == 0x309:
		print("Found combo!")
		print(combo)
		c = combo
		break

a = ["0" for _ in range(32)]
for num in c:
	val = a[options.index(num)]
	a[options.index(num)] = "1"
	options[options.index(num)] = -1

a = "".join(a)
print(a.count("1"))
print(a)
print(hex(int(a, 2)))
print("done.")
