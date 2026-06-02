const API_URL = "https://jsonplaceholder.typicode.com/posts";

const openDialog = document.querySelector("#open-dialog");
const popupElement = document.querySelector("#popup");
const closeDialog = document.querySelector("#close-dialog");

const form = document.querySelector("#form");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const userIdInput = document.querySelector("#userId");
const postIdInput = document.querySelector("#postId");

const dialogTitle = document.querySelector("#dialog-title");
const submitButton = document.querySelector("#submit-button");
const postsList = document.querySelector("#posts-list");

let posts = [];

openDialog.addEventListener("click", () => {
  postIdInput.value = "";
  form.reset();
  dialogTitle.textContent = "Add post";
  submitButton.textContent = "Add";

  popupElement.showModal();
});

closeDialog.addEventListener("click", () => {
  popupElement.close();
});

async function getAllPosts() {
  try {
    const response = await fetch(`${API_URL}?_limit=10`);
    posts = await response.json();

    renderPosts(posts);
  } catch (error) {
    console.log(error);
  }
}

getAllPosts();

function renderPosts(posts) {
  let postsHtml = "";

  posts.forEach((post) => {
    postsHtml += `
      <article class="post-card" data-id="${post.id}">
        <h2>${post.title}</h2>
        <p>${post.body}</p>

        <div class="post-actions">
          <button class="edit-button" type="button" data-id="${post.id}">
            Edit
          </button>

          <button class="delete-button" type="button" data-id="${post.id}">
            Delete
          </button>
        </div>
      </article>
    `;
  });

  postsList.innerHTML = postsHtml;

  postActions();
}

async function deletePost(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    console.log("Post deleted:", id);
  } catch (error) {
    console.log(error);
  }
}

async function updatePost(post) {
  try {
    const response = await fetch(`${API_URL}/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error("Failed to update post");
    }

    const updatedPost = await response.json();

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

function postActions() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  const editButtons = document.querySelectorAll(".edit-button");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = Number(button.dataset.id);
      const card = button.closest(".post-card");

      await deletePost(postId);

      posts = posts.filter((post) => post.id !== postId);
      card.remove();
    });
  });

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const postId = Number(button.dataset.id);
      const selectedPost = posts.find((post) => post.id === postId);

      postIdInput.value = selectedPost.id;
      titleInput.value = selectedPost.title;
      bodyInput.value = selectedPost.body;
      userIdInput.value = selectedPost.userId;

      dialogTitle.textContent = "Edit post";
      submitButton.textContent = "Update";

      popupElement.showModal();
    });
  });
}

async function createNewPost(post) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const createdPost = await response.json();

    return createdPost;
  } catch (error) {
    console.log(error);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const postData = {
    title: titleInput.value,
    body: bodyInput.value,
    userId: Number(userIdInput.value),
  };

  if (postIdInput.value) {
    const updatedPost = await updatePost({
      ...postData,
      id: Number(postIdInput.value),
    });

    posts = posts.map((post) => {
      if (post.id === updatedPost.id) {
        return updatedPost;
      }

      return post;
    });
  } else {
    const createdPost = await createNewPost(postData);

    posts.unshift(createdPost);
  }

  renderPosts(posts);

  form.reset();
  postIdInput.value = "";
  dialogTitle.textContent = "Add post";
  submitButton.textContent = "Add";
  popupElement.close();
});
