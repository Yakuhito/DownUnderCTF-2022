codehash = 0x6bca38432e686d0a2ab98d1cab5f21998075ffef811b6bb03d52812fa9a8f752

def tryMagicVal(magicVal):
	A = 0
	B = 0
	C = 0
	while A < 0x20:
		if (magicVal >> A) & 1 == 1:
			C += (codehash >> (8 * A)) & 0xff
			B += 1
		A += 1
	return B == 0x11 and C % 0x539 == 0x309

i = 0
while i < 0xffffffff:
	if i % 0xffff == 0:
		print(hex(i))
	if tryMagicVal(i):
		print("FOUND!")
		print(i)
		print(hex(i))
		break
	i += 1
