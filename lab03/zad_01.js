const arr = [
    { 
      id: 'abc',
      name: 'Ala'
    },
    {
      id: 'def',
      name: 'Tomek'
    },
    {
      id: 'ghi',
      name: 'Jan'
    }
];

const newArr = arr.reduce((prev, curr, currIndex, arr) => {
    return { ...prev, [curr.id]: curr };
}, []);
console.log(newArr);