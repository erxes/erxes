def UniquePartitions(self, n):
	    dp = {1: ((1,),)}
        def recur(num):
            for i in range(2, num+1):
                cur = [[i]]
                for j in range(1, (i//2)+1):
                    for k in dp[i-j]:
                        cur.append(sorted(list(k)+[j], reverse=True))
                dp[i] = tuple(set(map(tuple, cur)))
        recur(n)
        
        return sorted(dp[n], reverse=True)
 
