const axios = require('axios').default;
const URL = "https://jsonplaceholder.typicode.com";

const randomPostsIds = [];
for (let i = 0; i < 5; i++) {
    randomPostsIds.push(Math.floor(Math.random() * 100));
}

const instance = axios.create({
    baseURL: URL,
    timeout: 5000
});

const myObject = {};

const getMyObject = async (postId) => {
    const myObject = {};

    const postResponse = await instance.get(`/posts/${postId}`);
    if (postResponse.data) {
        const commentsResponse = await instance.get(`/posts/${postId}/comments`)
        myObject["entry"] = {
            title: postResponse.data.title,
            body: postResponse.data.body
        };
        if (commentsResponse.data) {
            myObject["comments"] = [];
            commentsResponse.data.forEach(comment => {
                myObject["comments"].push({
                    name: comment.name,
                    email: comment.email,
                    body: comment.body
                });
            });
        }
        return myObject;
    } else {
        return null;
    }
};

const getMyArray = async () => {
    const myArray = [];
    for (let j = 0; j < randomPostsIds.length; j++) {
        myArray.push(await getMyObject(randomPostsIds[j]));
    }
    return myArray;
}

(async () => {
    const myJSONArray = await getMyArray().catch((error) => console.log(error));
    console.log(myJSONArray);
})();

