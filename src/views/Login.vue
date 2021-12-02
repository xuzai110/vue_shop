<template>
  <div>
    <div class="login_content">
      <div class="login_box">
        <div class="img_box">
          <img src="@/assets/logo.png" alt="" />
        </div>
        <div class="login_form">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginFormRules"
          >
            <el-form-item class="ipt_box" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user-solid"
              ></el-input>
            </el-form-item>
            <el-form-item class="ipt_box" prop="password">
              <el-input
                v-model="loginForm.password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                type="password"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="btn">
            <el-button type="primary" @click="validateLoginForm"
              >登录</el-button
            >
            <el-button type="info" @click="resetForm">重置</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2到 8 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 8, message: '长度在6到 8 个字符', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    resetForm() {
      this.$refs.loginFormRef.resetFields();
    },
    validateLoginForm() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post('login', this.loginForm);
        if (res.meta.status !== 200) {
          this.$message.error('登录失败');
        } else {
          this.$message({
            message: '登录成功',
            type: 'success',
          });
          window.sessionStorage.setItem('token', res.data.token);
          //编程式导航
          this.$router.push('/home');
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_content {
  width: 100%;
  height: 650px;
  background-color: aquamarine;
  .login_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 30%);
    width: 450px;
    height: 380px;
    background-color: rgb(250, 253, 251);

    .img_box {
      height: 130px;
      width: 130px;
      border-radius: 50%;
      border: 1px solid #ddd;
      box-shadow: 0 0 10px #ddd;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 70px;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }
  }
}

.van-button--default {
  background-color: #969799;
}
.btn {
  position: absolute;
  bottom: -28px;
  right: 20px;
}
</style>
