# Left to Right comb method with windows of width w for multiplication.

 From: https://lihaoxu.eng.wayne.edu/NISL/Papers/Journals/tos-gf.pdf

We give now some details on the left-to-right comb method with windows of width
w for multiplication. This method computes the multiplication of two polynomials
a(x) and b(x) of degree at most n − 1 over GF(2). It is intuitively based on the
observation that if b(x) * x^k is computed for a k ∈ [0, W −1], where W is the machine
word size, then b(x) * x^(W * j+k) can be computed by simply appending j zero words to
the right of b(x) * x^k  ([Hankerson et al. 2000; L´opez and Dahab 2000]). 

Furthermore, this method is accelerated significantly at the expense of a little storage
overhead.   It first computes b(x) * h(x) for all polynomials h(x) of degree at most w − 1, and
then it can process w bits of a(x) at once rather than only one bit at a time. The
pseudocode of this method is shown in Algorithm 1. 

In Algorithm 1, a, b, and c are coefficient vectors representing polynomials 
a(x), b(x) and c(x). a is a vector of words of the form (a[s − 1], a[s − 2], · · · a[1], a[0]), 
where s = ⌈n/W⌉. 

Similar notations are used for b and c. One thing to note is that as Algorithm 1 runs, the
length of c is 2s, while the length of a and b is constant at s. More details of this
method are available in [Hankerson et al. 2000; L´opez and Dahab 2000].

In the multiplication operation, the left-to-right comb method with windows of
width w is followed by a modular reduction step in which the degree of c(x) is
reduced from at most 2n − 2 to at most n − 1. Generally, modular reduction for a
random irreducible polynomial f(x) is performed bit by bit, i.e., the degree of c(x)
is reduced by one in each step. However, if f(x) is a trinomial or pentanomial (i.e.,
it has three or five non-zero coefficients, recommended by NIST in the standards
for public key cryptography [for Standards and Technology 2009]), the reduction
step can be efficiently performed word by word [Guajardo et al. 2006]. Then, the
degree of c(x) is reduced by W in one step, and the modular reduction of c(x) is
greatly sped up. In this paper, we only use trinomial or pentanomial irreducible
polynomials for finite fields ranging from GF(232) to GF(2128), and therefore we
perform the modular reduction of the multiplication result one word at a time.

Algorithm 1 Left-to-right comb method with windows of width w
INPUT: Binary polynomials a(x) and b(x) of degree at most n − 1 represented
with vectors a and b, and s = ⌈n/W⌉

OUTPUT: c(x) = a(x) · b(x) represented with vector c

    1: Precompute bh = b(x) * h(x) for all polynomials h(x) of degree at most w − 1
    2: c = 0;
    3: for k from W/w − 1 to 0 do
    4:   for j from 0 to s − 1 do
    5:     Let h = (hw−1, hw−2, ..., h1, h0), where ht is bit (wk + t) of a[j]
    6:     for i from 0 to s − 1 do
    7:        c[i + j] = bh + c[i + j]
    8:     end for
    9:   end for
   10:   if k 6 == 0 then
   11:      c ← c * x^w;
   12:   end if
   13: end for

## Collected Notes

Generalized algorithm for multiplying 2 polynomials using array to represent their coefficients in python (cause python is better).

    def mp(p1,p2):
        # max order of product is len(p1) + len(p2) - 1
        def p3 = [0]*(len(p1) + len(p2) - 1)

        # multiply the coefficients for each term in the output
        for i in range(len(p1)):
            for j in range(len(p2)):
                p3[i+j] = p3[i+j] + p1[i]*p2[j]
        return p3

    print(mp([2,1], [1,1,2]))
    print(mp([2,0,1],[1,0,0,0]))

the above prints: 
    
    [2,3,5,2]
    [2, 0, 1, 0, 0, 0]

Workng by hand we have 
    (2x + 1)(x^2 + x + 2) 
        = 2x^3 + 2x^2 + 4x + x^2 + x + 2 
        = 2x^3 + 3x^2 + 5x + 2 --- Note the coefficients 2,3,5,2

    (2x^2 + 1)(x^4) 
        = 2x^6 + x^4
        = 2x^6 + 0x^5 + x^4 + 0x^3 + 0x^2 + 0x + 0 -- Note the coefficients 2,0,1,0,0,0

So now lets examine the AES Standards definition of 4 term polynomial multiplication. 
Under this scheme we have an array of 4 bytes such as a single column from the state box.
The bytes can take any value from 0 - 255 (0000 0000 ... 1111 1111).
So lets take an example array:

     [0x20, 0xF3, 0A2, 0x01]






# References
[Hankerson et al. 2000] -  Software Implementation of Elliptic Curve Cryptography Over Binary Fields. In CHES ’00: Workshop on Cryptographic Hardware and Embedded Systems

[L´opez and Dahab 2000] -  High-speed Software Multiplication in F2m. In INDOCRYPT’00: Proc. of the Annual International Conference on Cryptology in India