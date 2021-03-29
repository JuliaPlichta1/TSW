const fakeRequest = async (url) => {
    const responses = {
        "file1": "The first text",
        "file2": "The middle text",
        "file3": "The last text"
    };
    const randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;

    console.log("Pobieram: " + url);

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(responses[url]);
        }, randomDelay);
    });
};

const output = (text) => {
    console.log(text);
};

// zmodyfikuj poniższą definicję wykorzystując pojęcie „domknięcia” (por. wykład)
const getFile = (function () {
    const responses = {};
    return async (file) => {
        const text = await fakeRequest(file);
        responses[file] = { text, printed: false };
        const check = (responses) => {
            if (responses["file1"] && !responses["file1"].printed) {
                output(responses["file1"].text);
                responses["file1"].printed = true;
                check(responses);
            } else if (responses["file2"] && !responses["file2"].printed 
                    && responses["file1"] && responses["file1"].printed) {
                output(responses["file2"].text);
                responses["file2"].printed = true;
                check(responses);       
            } else if (responses["file3"] && !responses["file3"].printed
                    && responses["file1"] && responses["file1"].printed 
                    && responses["file2"] && responses["file1"].printed) {
                output(responses["file3"].text);
                responses["file3"].printed = true;
                output("Zakończono!");      
            }
        };
        check(responses);
    };
})();

// żądania
getFile("file1");
getFile("file2");
getFile("file3");
