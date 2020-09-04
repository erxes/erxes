[ISSUE](https://github.com/erxes/erxes/issues/ISSUE)

### Context

#include <stdio.h>
int main() {
   int year;
   printf("Enter a year: ");
   scanf("%d", &year);

   // leap year if perfectly visible by 400
   if (year % 400 == 0) {
      printf("%d is a leap year.", year);
   }
   // not a leap year if visible by 100
   // but not divisible by 400
   else if (year % 100 == 0) {
      printf("%d is not a leap year.", year);
   }
   // leap year if not divisible by 100
   // but divisible by 4
   else if (year % 4 == 0) {
      printf("%d is a leap year.", year);
   }
   // all other years are not leap year
   else {
      printf("%d is not a leap year.", year);
   }

   return 0;
}


A leap year is exactly divisible by 4 except for century years (years ending with 00). The century year is a leap year only if it is perfectly divisible by 400.

For example,

1999 is not a leap year
2000 is a leap year
2004 is a leap year


Output 1

Enter a year: 1900
1900 is not a leap year.
