// export const rf = (data, list) => {
export const rf = () => {
  // data = {...}

  const data = {
    date: new Date(),
    branchId: 'X5BcGHpzxofkTq8TL',
    departmentId: 'ELea5cmuCwuQZy7qH',
    time: {
      timeId: [
        { productId: 'Q7r2s3fJM3F88YkTD', count: 3 },
        { productId: 'HPSTWpeP5pcS4vTzj', count: 2 }
      ]
    }
  };
  return data;
};

// data: {date: Date, branchId: string, departmentId: string, time: {timeId:  [{productId: string, count: number}]} }
