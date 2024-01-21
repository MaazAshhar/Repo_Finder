const DEFAULT_USERNAME = "maazashhar";
const DEFAULT_PAGE_LIMIT = 10;
let cur_url;
let pagination_data;
let cur_page;
getUsernameAndCallApi();
function getUsernameAndCallApi() {
    const url = new URL(window.location.href);
    cur_url = url;
    const username = url.searchParams.get("username") || DEFAULT_USERNAME;
    const per_page = url.searchParams.get("per_page") || DEFAULT_PAGE_LIMIT;
    const page = url.searchParams.get("page") || 1;
    cur_page = parseInt(page);
    getUserInfo(username);
    getPublicRepo(username, per_page, page);
}
function handleRepoInfo(res) {
    let repoString = "";
    res.forEach(repo => {
        repoString = addRepo(repo, repoString);
    });
    const user_repo = document.getElementById("user_repo");
    user_repo.innerHTML = repoString;
    handlePagination();
}
function handleUserInfo(res) {
    if (res.message && res.message == "Not Found") {
        window.location.href = String(cur_url.origin)+String(cur_url.pathname);
        alert("Please provide a valid username. I'm redirecting to the default username");
    }
    const name = document.getElementById("name");
    const bio = document.getElementById("bio");
    const image = document.getElementById("image");
    const github_url = document.getElementById("github_url");

    name.innerText = res.name;
    bio.innerText = res.bio;
    image.setAttribute("src", res.avatar_url);
    github_url.setAttribute("href", res.html_url);
    github_url.innerText = `${res.html_url}`;

    if (res.twitter_username) {
        const twitter = document.getElementById("twitter");
        twitter.innerHTML = `Twitter: <a href="https://twitter.com/${res.twitter_username}" target="_blank" rel="noopener noreferrer">https://twitter.com/${res.twitter_username}</a>`;
    }
    if (res.location) {
        const location = document.getElementById("location");
        location.innerText = res.location;
    }
}
function getPublicRepo(username = DEFAULT_USERNAME, per_page = DEFAULT_PAGE_LIMIT, page = 1) {
    const api_url = `https://api.github.com/users/${username}/repos?per_page=${per_page}&page=${page}`;
    try {
        fetch(api_url)
            .then(res => {
                pagination_data = res.headers.get("Link");
                return res.json();
            })
            .then(res => handleRepoInfo(res))
            .catch(err => console.log(err));
    } catch (error) {
        alert("Please provide a valid username. I'm redirecting to the default username");
    }
}
function getUserInfo(username = DEFAULT_USERNAME) {
    const api_url = `https://api.github.com/users/${username}`;
    try {
        fetch(api_url)
            .then(res => res.json())
            .then(res => handleUserInfo(res))
            .catch(err => console.log(err));
    } catch (error) {
        alert("Please provide a valid username. I'm redirecting to the default username");
    }
}
function addRepo(repo, repoString) {
    repoString += `<div class="repo col-sm-5 my-3 col-10 rounded">
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"><h3 class="title" style="font-size:20px; word-wrap: break-word;">${repo.name}</h3></a>` +
        (repo.description != null ? `<h5 class="description" style="font-size:12px;">${repo.description}</h5>` : ``)
        + `<div class="topic d-flex flex-wrap mb-2">${addTopic(repo.topics)}</div>
                            </div>`;
    return repoString;
}
function addTopic(topics) {
    let topicString = "";
    topics.forEach(topic => {
        topicString += `<span class="bg-secondary rounded mx-1 my-1 px-2">${topic}</span>`;
    });
    return topicString;
}
function handlePagination() {
    if (!pagination_data) {
        return;
    }
    let data = pagination_data.split(",");
    const map = new Map();
    data.forEach(element => {
        let dataArray = element.split(";");
        dataArray[1] = dataArray[1].replace("rel=", "").replaceAll('"', "").trim();
        const url = new URL(dataArray[0].replace("<", "").replace(">", ""));
        map.set(dataArray[1], url.searchParams.get("page"));
    });
    addPagination(map);
}
function addPagination(map) {
    const first = map.get('prev') || 1;
    let paginationString = "";
    const url = cur_url;
    if (url.searchParams.has('page')) url.searchParams.delete('page');
    url.searchParams.append('page', cur_page);
    paginationString += `<ul class="pagination col-6 my-auto">`;
    if (map.has('prev')) {
        url.searchParams.set('page', map.get('prev'));
        paginationString += `<li class="page-item"> <a class="page-link" href = "${url.toString()}">Previous</a></li>`;
        paginationString += `<li class="page-item"><a class="page-link" href="${url.toString()}">${map.get('prev')}</a></li>`;
    } else {
        paginationString += `<li class="page-item"> <a class="page-link disabled" href = "">Previous</a></li>`;
    }
    url.searchParams.set('page', cur_page);
    paginationString += `<li class="page-item"><a class="page-link active" href="${url.toString()}">${cur_page}</a></li>`;
    if (cur_page + 1 <= map.get('last')) {
        url.searchParams.set('page', cur_page + 1);
        paginationString += `<li class="page-item"><a class="page-link" href="${url.toString()}">${cur_page + 1}</a></li>`;
    }
    url.searchParams.set('page', cur_page + 1);
    paginationString += `<li class="page-item"> <a class="page-link${(map.has('next') ? "" : " disabled")}" href = "${(map.has('next') ? url.toString() : "")}">Next</a></li>`;
    paginationString += "</ul>";
    const user_pagination = document.getElementById('user_pagination');
    user_pagination.innerHTML = paginationString;
}