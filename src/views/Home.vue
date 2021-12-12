<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>黑马后台管理系统</span>
      </div>
      <el-row>
        <el-button type="info" @click="logout">退出</el-button>
      </el-row>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '65px' : '200px'">
        <div class="btn" @click="collapseMenu">|||</div>
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            v-for="item in menuList"
            :key="item.id"
            :index="item.id + ''"
          >
            <template slot="title" class="title">
              <i :class="icons[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + child.path"
              v-for="child in item.children"
              :key="child.id"
              @click="activeMenu('/' + child.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ child.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      icons: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-check',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data',
      },
      isCollapse: false,
      activePath: '',
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus');
      this.menuList = res.data;
    },
    collapseMenu() {
      this.isCollapse = !this.isCollapse;
    },
    activeMenu(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    },
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  destroyed() {
    window.sessionStorage.setItem('activePath', '');
  },
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #5f656a;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: none;
    /deep/.el-submenu__title {
      padding: 0 70px;
    }
  }
}
.el-main {
  background-color: #e9edf2;
}
.el-container {
  height: 100%;
  width: 100%;
}
.btn {
  color: #fff;
  background-color: #dadee1;
  height: 24px;
  line-height: 24px;
  letter-spacing: 0.25em;
}
</style>
