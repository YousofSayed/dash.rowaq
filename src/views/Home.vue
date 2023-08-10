<template>
  <section class="home">
    <header>
      <div class="user" @click="showAndHideUserInfo(true)">
        <div class="name">{{ userInfo.name }}</div>
        <div class="image">
          <span v-if="!userInfo.prof_img" v-html="icons.user"></span>
          <img v-if="userInfo.prof_img" :src="userInfo.prof_img" alt="">
        </div>
      </div>
      <div class="loader" v-show="showLoader"></div>
    </header>

    <section class="mainContent">
      <span class="folder iconHandle" v-for="(folder, index) in folders" :id="folder.id" :rowIndex="folder.rowIndex"
        :name="folder.name" :dbName="folder.dbName" :key="index" @contextmenu.prevent="showContextMenu"
        @click="showMatrialsCb">
        <div class="icon" v-html="icons.folder"></div>
        <div class="desc">{{ folder.name }}</div>
      </span>

      <span class="addFolder iconHandle" @click="addFolderBtn('Sections')">
        <div class="icon" v-html="icons.folderPlus"></div>
        <div class="desc">اضافة قسم</div>
      </span>

      <span class="showMore" v-show="showMoreBtn"><button @click="showMore">اعرض المزيد</button></span>
    </section>

    <div class="contextMenu" ref="contextmenu">
      <div @click="renameBtnsClickCb">
        اعادة تسميه <span v-html="icons.pencil"></span>
      </div>
      <div class="warn" @click="removeFolder">مسح <span v-html="icons.trash"></span></div>
    </div>

    <div class="Popup" v-show="showPopup">
      <div class="warn">{{ warn }}</div>
      <div class="inputs">
        <span v-html="icons.folder"></span>
        <div class="inputsRow">
          <input type="text" placeholder="اكتب اسم القسم" v-model="nameOfFolder" ref="text" @keyup="removeWarn" />
          <input type="text" placeholder="ادخل رابط المحاضره" v-model="videoUrl" v-show="showVideoUrlInp" />
        </div>
      </div>
      <div class="btns">
        <button class="rename" @click="renameBtnCb" v-show="showRCCBtns">
          اعادة تسميه
        </button>
        <button class="create" @click="createFolderInDb" v-show="!showRCCBtns">
          انشأ
        </button>
        <button class="cancel" @click="showAndHidePopupCb(false)" v-show="!showRCCBtns">
          الغي
        </button>
      </div>
    </div>

    <div class="matrials" v-if="showMatrials">
      <div class="close" @click="closeMaterials" v-html="icons.xMark"></div>

      <span class="folder iconHandle" v-for="(material, index) in materials" :id="material.id"
        :rowIndex="material.rowIndex" :name="material.name" :dbName="material.dbName" :key="index"
        @contextmenu.prevent="showContextMenu" @click="showVideosAndBooksCb">
        <div class="icon" v-html="icons.folder"></div>
        <div class="desc">{{ material.name }}</div>
      </span>

      <span class="addFolder iconHandle" @click="showAndHidePopupCb(true)">
        <div class="icon" v-html="icons.folderPlus"></div>
        <div class="desc">اضافة قسم</div>
      </span>
    </div>

    <VideosAndBooks v-show="showVideosAndBooks" @close="closeShowVideosAndBooks" @uploadVideoBtnCb="uploadVideoBtnCb"
      @uploadBookBtnCb="uploadBookBtnCb" @showContextMenu="showContextMenu" :books="books" :videos="videos" />

    <UserInfo v-show="showUserInfo" :prof_img="userInfo.prof_img" :name="userInfo.name"
      :allow_permision="userInfo.allow_permision" :owner="userInfo.owner" @showAndHideUserInfo="showAndHideUserInfo"
      @getUsers="getUsers" @showAndHideCreateUser="showAndHideCreateUser" @uploadImg="uploadImg" />

    <CreateUser v-show="showCreateUser" @showAndHideLoader="showAndHideLoader"
      @showAndHideCreateUser="showAndHideCreateUser" />
    <DeleteUser v-show="showDeleteUsers" @getUsers="getUsers" @showAndHideLoader="showAndHideLoader"
      @showAndHideDeleteUser="showAndHideDeleteUser" :users="users" />
    <input type="file" id="inpFile" style="display: none" accept=".pdf,.xlxs,.docs,.docx" />
  </section>
</template>

<script>
import iconsC from "../app/icons.js";
import { $, uniqueID } from "../app/cocktail.js";
import { setData, getData, updateData, deleteData, tb } from "../app/db/db.js";
import VideosAndBooks from "../components/VideosAndBooks.vue";
import UserInfo from "../components/UserInfo.vue";
import CreateUser from '../components/CreateUser.vue'
import DeleteUser from "../components/DeleteUser.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
  components: { VideosAndBooks, UserInfo, CreateUser, DeleteUser },
  setup() {
    const router = useRouter();
    const icons = iconsC;
    const userInfo = ref({
      name: '',
      prof_img: '',
      email: '',
      owner: null,
      allow_permision: null,
      prof_header_imgInner: icons.user,
      rowNum: null,
    })
    const showPopup = ref(false);
    const showLoader = ref(true);
    const showRCCBtns = ref(false);
    const showMoreBtn = ref(false);
    const showMatrials = ref(false);
    const showVideosAndBooks = ref(false);
    const showVideoUrlInp = ref(false);
    const showUserInfo = ref(false);
    const showCreateUser = ref(false);
    const showDeleteUsers = ref(false);
    const folderDetails = ref(null);
    const contextmenu = ref(null)
    const folders = ref([]);
    const materials = ref([]);
    const books = ref([]);
    const videos = ref([]);
    const users = ref([])
    const warn = ref("");
    const nameOfFolder = ref(null);
    const videoUrl = ref(null);
    let folderTargeted = null; //For reanme or delete
    let dbName = null; // I know that it by default equal null :)
    //if you know any way to shorhand all of this vars please call me on whatsApp "01120020790" :)

    const uploadImg = async (blobFileImg) => {
      const res = await tb.sendImage(blobFileImg)
      if (res.ok) {
        const id = res.id;
        const resFromDb = await updateData({
          dbName: 'Admins',
          rowNum: userInfo.value.rowNum,
          newData: {
            prof_img: id,
          }
        })

        userInfo.value.prof_img = await (await tb.compressURL(id)).compresedURl;
        if (resFromDb.ok) console.log('Image uploaded');

      }
    }

    const getUser = async () => {
      const res = await getData({
        dbName: 'Admins',
        query: `where={"email":"${localStorage.getItem('email')}"}`
      })
      if (!res.results) { getUser(); return res.message }
      const results = res.results[0];
      userInfo.value.name = results.name;
      userInfo.value.rowNum = results.rowIndex;
      userInfo.value.prof_img = results.prof_img ? await (await tb.compressURL(results.prof_img)).compresedURl : false;
      userInfo.value.prof_header_imgInner = results.prof_img ? `<img src="${userInfo.value.prof_img}" loading="lazy" />` : icons.user;
      userInfo.value.allow_permision = results.allow_permision == 'TRUE' ? true : false;
      userInfo.value.owner = results.owner == 'TRUE' ? true : false;
    }
    getUser();

    const getAndSetData = async () => {
      const data = await getData({ dbName: "Sections" });
      showMoreBtn.value = data.hasNextPage ? true : false;
      folders.value = data.results;
      showLoader.value = false;
    };
    getAndSetData();

    const showMore = async (e) => {
      const skipedLength = folders.value.length;
      showLoader.value = true;
      const data = await getData({ dbName: "Sections", query: `skip=${skipedLength}` });
      folders.value.push(...data.results);
      showLoader.value = false;
    };

    const showAndHideLoader = (bol) => {
      showLoader.value = bol;
    }

    const showAndHidePopupCb = (bol) => {
      showPopup.value = bol;
    };

    const addFolderBtn = () => {
      console.log(showPopup.value);
      dbName = 'Sections';
      showRCCBtnsCb(false);
      showAndHidePopupCb(true);
    };

    const showRCCBtnsCb = (bol) => {
      //RCC shorthand for "Rename" , "Create" , "Cancel"
      showRCCBtns.value = bol;
    };

    const createFolderInDb = async () => {
      if (!nameOfFolder.value) {
        warn.value = "من فضلك ادخل اسم القسم";
        return;
      }
      if (showVideoUrlInp.value == true && !videoUrl.value) {
        warn.value = "يجب ادخال الرابط";
        return;
      }
      console.log('ahhh');
      showAndHidePopupCb(false);
      showRCCBtnsCb(false);

      if (dbName == "Sections") {
        const data = await setData({
          dbName: dbName,
          data: {
            name: nameOfFolder.value,
            id: uniqueID(),
            dbName: dbName,
          },
        });
        folders.value.push(data);
      } else if (dbName == "Materials") {
        const data = await setData({
          dbName: dbName,
          data: {
            name: nameOfFolder.value,
            id: folderDetails.value.id,
            section: folderDetails.value.section,
            dbName: dbName,
          },
        });

        materials.value.push(data);
      } else if (dbName == "Videos") {
        const data = await setData({
          dbName: dbName,
          data: {
            id: folderDetails.value.id,
            section: folderDetails.value.section,
            material: folderDetails.value.material,
            name: nameOfFolder.value,
            url_id: videoUrl.value,
            dbName: dbName,
          },
        });
        videos.value.push(data);
      }
      //Books db handeled in (uploadBookBtnCb) function
    };

    const removeWarn = () => {
      warn.value = "";
    };

    const showContextMenu = (e) => {
      const target = e.currentTarget;
      console.log(target);
      folderTargeted = {
        target: target,
        dbName: target.getAttribute("dbName"),
        id: target.id,
        name: target.getAttribute("name"),
        rowNum: target.getAttribute("rowIndex"),
      };
      console.log(folderTargeted);

      contextmenu.value.classList.add("show");
      contextmenu.value.style.left = `${e.pageX - 100}px`;
      contextmenu.value.style.top = `${e.pageY}px`;
    };
    window.addEventListener("click", () => {
      contextmenu.value?.classList.remove("show");
    });

    const removeFolder = async (e) => {
      const conf = confirm("هل انت متأكد من مسح هذا القسم ؟");
      if (!conf) return;

      showLoader.value = true;
      const dataDeleted = await deleteData({
        dbName: folderTargeted.dbName,
        rowNum: folderTargeted.rowNum,
      });

      if (dataDeleted.ok) {
        if (folderTargeted.dbName == "Sections") {
          const dataGeted = await getData({ dbName: folderTargeted.dbName });
          folders.value = dataGeted.results;
        } else if (folderTargeted.dbName == "Materials") {
          const dataGeted = await getData({
            dbName: folderTargeted.dbName,
            query: `where={"id":"${folderDetails.value.id}"}`,
          });
          materials.value = dataGeted.results;
        } else if (folderTargeted.dbName == "Videos") {
          const dataGeted = await getData({
            dbName: folderTargeted.dbName,
            query: `where={"id":"${folderDetails.value.id}","section":"${folderDetails.value.section}","material":"${folderDetails.value.material}"}`,
          });
          videos.value = dataGeted.results;
        } else if (folderTargeted.dbName == "Books") {
          const dataGeted = await getData({
            dbName: folderTargeted.dbName,
            query: `where={"id":"${folderDetails.value.id}","section":"${folderDetails.value.section}","material":"${folderDetails.value.material}"}`,
          });
          books.value = dataGeted.results;
        }

        showLoader.value = false;
      }
    };

    const renameBtnsClickCb = () => {
      showAndHidePopupCb(true);
      showRCCBtnsCb(true);
    };

    const renameBtnCb = async () => {
      console.log(folderDetails.value, nameOfFolder.value);
      showAndHidePopupCb(false);
      showRCCBtnsCb(false);

      const dataUpdated = await updateData({
        dbName: folderTargeted.dbName,
        rowNum: folderTargeted.rowNum, //rowNum
        newData: {
          name: nameOfFolder.value,
        },
      });
      folderTargeted.target.children[1].textContent = nameOfFolder.value;
    };

    const closeMaterials = () => {
      showMatrials.value = false;
      dbName = "Sections";
    };

    const showMatrialsCb = async (e) => {
      materials.value = [];
      const target = e.currentTarget;
      showLoader.value = true;
      folderDetails.value = {
        target: target,
        id: target.id,
        section: target.getAttribute("name"),
        rowNum: target.getAttribute("rowIndex"),
      };
      showMatrials.value = true;
      dbName = "Materials";

      const data = await getData({
        dbName: dbName,
        query: `where={"id":"${folderDetails.value.id}"}`,
      });
      materials.value = data.results;
      showLoader.value = false;
    };

    const showVideosAndBooksCb = async (e) => {
      console.log(folderDetails.value);
      books.value = videos.value = [];
      showVideosAndBooks.value = true;
      showLoader.value = true;
      const target = e.currentTarget;
      folderDetails.value.material = target.getAttribute("name");
      const query = `where={"section":"${folderDetails.value.section}","material":"${folderDetails.value.material}","id":"${folderDetails.value.id}"}`;
      const videosData = await getData({
        dbName: "Videos",
        query: query,
      });
      videos.value = videosData.results;

      const booksData = await getData({
        dbName: "Books",
        query: query,
      });
      books.value = booksData.results;
      showLoader.value = false;
    };

    const closeShowVideosAndBooks = () => {
      showVideosAndBooks.value = false;
      showVideoUrlInp.value = false;
      dbName = "Materials";
    };

    const uploadVideoBtnCb = (e) => {
      showAndHidePopupCb(true);
      showVideoUrlInp.value = true;
      dbName = "Videos";
    };

    const uploadBookBtnCb = () => {
      dbName = "Books";
      $("#inpFile").click();
      $("#inpFile").on("change", async (e) => {
        const file = e.target.files[0];
        const cnrfm = confirm(` هل انت متأكد من رفع هذا الكتاب : "${file.name}" ؟`);
        if (cnrfm) {
          showLoader.value = true;
          const res = await tb.sendFile(file);
          if (res.ok) {
            try {
              const data = await setData({
                dbName: dbName,
                data: {
                  name: file.name,
                  id: folderDetails.value.id,
                  url_id: res.id,
                  section: folderDetails.value.section,
                  material: folderDetails.value.material,
                  dbName: dbName,
                },
              });
              books.value.push(data);
              showLoader.value = false;
            } catch (error) {
              showLoader.value = false;
              throw new Error(error.message);
            }
          }
        }
      });
    };

    const showAndHideUserInfo = (bol) => {
      showUserInfo.value = bol;
    }

    const showAndHideCreateUser = (bol) => {
      console.log(bol);
      showCreateUser.value = bol;
    }

    const showAndHideDeleteUser = (bol) => {
      showDeleteUsers.value = bol;
    }

    const getUsers = async () => {
      showAndHideDeleteUser(true);
      showAndHideLoader(true)
      const res = await getData({ dbName: 'Admins' });
      if (res.results) {
        const usersRes = res.results;
        for (const user of usersRes) {
          user.prof_img = user.prof_img ? ((await tb.compressURL(user.prof_img))?.compresedURl) : '';
          user.password = 'You must not see that ;)';
        }
        users.value = [...usersRes];
      } else {
        throw new Error(res.message)
      }
      showAndHideLoader(false)

    }

    return {
      userInfo,
      icons,
      folders,
      showPopup,
      warn,
      nameOfFolder,
      contextmenu,
      materials,
      books,
      videos,
      showLoader,
      showMoreBtn,
      showRCCBtns,
      showMatrials,
      showUserInfo,
      showCreateUser,
      showVideosAndBooks,
      showDeleteUsers,
      videoUrl,
      showVideoUrlInp,
      users,
      uploadImg,
      showAndHidePopupCb,
      showAndHideLoader,
      addFolderBtn,
      createFolderInDb,
      removeWarn,
      showMore,
      showContextMenu,
      removeFolder,
      closeMaterials,
      showRCCBtnsCb,
      renameBtnsClickCb,
      renameBtnCb,
      showMatrialsCb,
      showVideosAndBooksCb,
      closeShowVideosAndBooks,
      uploadVideoBtnCb,
      uploadBookBtnCb,
      showAndHideUserInfo,
      showAndHideCreateUser,
      showAndHideDeleteUser,
      getUsers,
    };
  },
};
</script>
