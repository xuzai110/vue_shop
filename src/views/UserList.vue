<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="paramsInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addUserDialog = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 数据渲染表格 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserInfo(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserInfo(scope.row.id)"
            ></el-button>

            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="settingUserInfo(scope.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="paramsInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="paramsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->

    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialog"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <!-- 使用disabled属性文本框只读 -->
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkMobile = (rule, value, cb) => {
      const refMobile =
        /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\d{8}$/;

      if (refMobile.test(value)) {
        return cb();
      }
      cb(new Error('请输入正确合法的手机号'));
    };
    return {
      paramsInfo: {
        //query查询参数
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      addUserDialog: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 8,
            message: '长度在2~8个字符之间',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 8,
            message: '长度在6~8个字符之间',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.paramsInfo,
      });

      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newPagesize) {
      this.paramsInfo.pagesize = newPagesize;
      this.getUserList();
    },
    handleCurrentChange(handleCurrentChange) {
      this.paramsInfo.pagenum = handleCurrentChange;
      this.getUserList();
    },
    async userStateChange(data) {
      const { data: res } = await this.$http.put(
        `users/${data.id}/state/${data.mg_state}`
      );
      if (res.meta.status !== 200) {
        data.mg_state = !data.mg_state;
        return this.$message.error('用户状态修改失败');
      }
      this.$message.success('用户状态修改成功');
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //点击，新增用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) return this.$message.error('添加用户失败');
        this.$message.success('添加用户成功');
        this.addUserDialog = false;
        this.getUserList();
      });
    },
    async editUserInfo(id) {
      const { data: res } = await this.$http.get('users/' + id);
      if (res.meta.status !== 200) return this.$message.error('获取信息失败');
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error('修改用户信息失败');
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success('修改用户信息成功');
      });
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //删除用户
    deleteUserInfo(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('users/' + id);
          if (res.meta.status !== 200)
            return this.$message.error('删除用户失败');
          this.$message.success('删除用户成功');
          this.getUserList();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          });
        });
    },
  },
  created() {
    this.getUserList();
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 12px;
  margin-bottom: 15px;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
  .el-table {
    margin-top: 20px;
  }
  .el-pagination {
    margin-top: 15px;
  }
}
</style>
