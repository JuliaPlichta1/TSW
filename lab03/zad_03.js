const groupBy = (tab, key) => {
    const initialValue = new Map();
    return tab.reduce((prev, curr, currIndex) => {
        if (prev.get(key(curr))) {
            prev.set(key(curr), [...prev.get(key(curr)), curr]);
        } else {
            prev.set(key(curr), [curr]);
        }
        return prev;
    }, initialValue);
};

const res = groupBy([3,2,4,4,3], n => n % 2 === 0);
console.log(res);