import random

n = 120

# Create matrices
A = [[random.randint(1, 10) for _ in range(n)] for _ in range(n)]
B = [[random.randint(1, 10) for _ in range(n)] for _ in range(n)]

# Multiply matrices
result = [[0 for _ in range(n)] for _ in range(n)]

for i in range(n):
    for j in range(n):
        s = 0
        for k in range(n):
            s += A[i][k] * B[k][j]
        result[i][j] = s

print(result[0][0])
