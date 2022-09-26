import itertools

xor_values = [0x4A, 0xD1, 0x64, 0xB2, 0x63, 0xC4]

for subset_len in range(1, len(xor_values)):
	for subset in itertools.combinations(xor_values, subset_len):
		x = 0
		for elem in subset:
			x ^= elem
		if x == 0xFF:
			print(f"Found subset: {[hex(e) for e in subset]}")
