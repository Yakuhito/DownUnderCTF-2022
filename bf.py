import sha3

i = 0x12345678
limit = 256 * 256 * 256 * 256

def check(i):
	b = bytes.fromhex(hex(i)[2:].rjust(8, "0"))
	print(b)
	k = sha3.keccak_256()
	k.update(b)
	if (int(k.hexdigest(), 16) & 0xFF) == 0x77:
		return True
	return False


while i < limit:
	if check(i):
		print("FOUND ID")
		print(hex(i))
		break
	elif i % 0xfffff == 0:
		print(hex(i))
	i += 1
