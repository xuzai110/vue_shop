<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <el-col :span="4">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['boderbottom', i1 == 0 ? 'bodertop' : '']"
              type="flex"
              align="middle"
            >
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="deleteRight(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="i2 == 0 ? '' : 'bodertop'"
                  type="flex"
                  align="middle"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRight(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRight(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleInfo(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoleInfo(scope.row.id)"
            ></el-button>

            <el-tooltip
              effect="dark"
              content="分配权限"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="settingRoleRight(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightsDialogVisible"
      width="50%"
      @close="cleanRightsCheckedList"
    >
      <el-tree
        :data="rightsList"
        :props="rightsProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="rightsCheckedList"
        ref="rightRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="rolesDialogVisible"
      width="50%"
      @close="cleanRoleInfo"
    >
      <el-form ref="editRoleForm" :model="roleInfo" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsDialogVisible: false,
      rightsList: [],
      rightsProps: {
        children: 'children',
        label: 'authName',
      },
      rightsCheckedList: [],
      roleId: '',
      rolesDialogVisible: false,
      roleInfo: {},
    };
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200)
        return this.$message.error('角色列表请求失败');
      this.rolesList = res.data;
    },
    async deleteRight(role, rightId) {
      const result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err);
      if (result !== 'confirm') return this.$message.info('取消删除权限');
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error('删除权限失败');
      role.children = res.data;
      this.$message.success('删除权限成功');
    },
    async settingRoleRight(role) {
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200)
        return this.$message.error('获取权限信息失败');
      this.rightsList = res.data;

      this.checkRight(role, this.rightsCheckedList);

      this.rightsDialogVisible = true;
      this.roleId = role.id;
    },
    // 打开页面时权限默认为勾选状态
    checkRight(node, arr) {
      node.children.forEach((item) => {
        if (!item.children) {
          return arr.push(item.id);
        }
        this.checkRight(item, arr);
      });
    },
    cleanRightsCheckedList() {
      this.rightsCheckedList = [];
    },
    async allotRights() {
      const keys = [
        ...this.$refs.rightRef.getCheckedKeys(),
        ...this.$refs.rightRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(',');
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) return this.$message.error('分配权限失败!');
      this.$message.success('分配权限成功');
      this.getRolesList();
      this.rightsDialogVisible = false;
    },
    async editRoleInfo(roleId) {
      const { data: res } = await this.$http.get(`roles/${roleId}`);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败');
      }

      this.roleInfo = res.data;
      this.rolesDialogVisible = true;
    },
    async editRole() {
      if (this.roleInfo.roleName === '') {
        return this.$message.error('请填写角色名称');
      }
      const { data: res } = await this.$http.put(
        `roles/${this.roleInfo.roleId}`,
        {
          roleName: this.roleInfo.roleName,
          roleDesc: this.roleInfo.roleDesc,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色信息失败！');
      }
      this.$message.success('修改角色成功');
      this.getRolesList();
      this.rolesDialogVisible = false;
    },
    cleanRoleInfo() {
      this.roleInfo = {};
    },
    async deleteRoleInfo(roleId) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err);
      console.log(result);
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + roleId);
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败');
        }
        this.$message.success('删除角色成功');
        this.getRolesList();
        this.rolesDialogVisible = false;
      }
      if (result === 'cancel') {
        this.$message.info('已取消删除');
      }
    },
  },
  created() {
    this.getRolesList();
  },
};
</script>

<style lang="less" scoped>
.bodertop {
  border-top: 1px solid #e9edf2;
}
.boderbottom {
  border-bottom: 1px solid #e9edf2;
}
.el-tag {
  margin: 10px;
}
</style>
