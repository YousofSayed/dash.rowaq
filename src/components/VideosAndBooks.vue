<template>
  <div class="videosAndBooks">
    <div class="close" @click="$emit('close')" v-html="icons.xMark"></div>
    <h1 class="title">المحاضرات</h1>
    <div class="videos">
      <div
        class="video iconHandle"
        v-for="(video, index) in videos"
        :id="video.id"
        :name="video.name"
        :url_id="video.url_id"
        :rowIndex="video.rowIndex"
        :dbName="video.dbName"
        @contextmenu.prevent="showContextmenu"
      >
        <div class="icon" v-html="icons.video"></div>
        <div class="desc">{{ video.name }}</div>
      </div>
      <div class="uploadVideo iconHandle" @click="$emit('uploadVideoBtnCb')">
        <div v-html="icons.upload"></div>
        <div class="desc">رفع محاضره</div>
      </div>
    </div>

    <h1 class="title">الكتب</h1>
    <div class="books">
      <div
        class="book iconHandle"
        v-for="(book, index) in books"
        :id="book.id"
        :name="book.name"
        :url_id="book.url_id"
        :rowIndex="book.rowIndex"
        :dbName="book.dbName"
        @contextmenu.prevent="showContextmenu"
      >
        <div class="icon" v-html="icons.openBook"></div>
        <div class="desc">{{ book.name }}</div>
      </div>
      <div class="uploadBook iconHandle" @click="$emit('uploadBookBtnCb')">
        <span v-html="icons.upload"></span>
        <div class="desc">رفع كتاب</div>
      </div>
    </div>
  </div>
</template>

<script>
import iconsC from "../app/icons.js";

export default {
  props: ["videos", "books"],
  setup(props, { emit }) {
    const icons = iconsC;
    const showContextmenu = (event) => {
      emit("showContextMenu", event);
    };
    return { showContextmenu, icons };
  },
};
</script>
