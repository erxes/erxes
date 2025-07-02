export const collections = {
  customers: (NOW_MONTH) => ({
    $expr: {
      $and: [
        {
          $eq: [
            {
              $month: `$birthDate`,
            },
            NOW_MONTH,
          ],
        },
      ],
    },
  }),
  users: (NOW_MONTH) => ({
    query: {
      $expr: {
        $and: [
          {
            $eq: [
              {
                $month: `$details.birthDate`,
              },
              NOW_MONTH,
            ],
          },
        ],
      },
    },
  }),
};
