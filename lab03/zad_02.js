const wishlist = [
    {
      name: 'Czajnik',
      netto: 100
    },
    {
      name: 'Lodówka',
      netto: 1300
    },
    {
      name: 'Mikrofalówka',
      netto: 340
    },
    {
      name: 'Mikser',
      netto: 120
    },
    {
      name: 'Piekarnik',
      netto: 2100
    }
]
const func = (tab, trans) => {
    return tab.reduce((prev, curr, currIndex, array) => {
        return [...prev, trans(curr)]
    },[]);
}
const result = func(wishlist, x  => x.name + ' -> ' + x.netto);
console.log(result);