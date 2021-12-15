<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addAttr"
            >添加参数</el-button
          >
          <el-table :data="manyData" style="width: 100%" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleTagClosed(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加标签按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  type="primary"
                  @click="showInput(scope.row)"
                  >添加标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作" width="190">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editAttr(scope.row.attr_id)"
                >
                  编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteAttr(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addAttr"
            >添加属性</el-button
          >
          <el-table :data="onlyData" style="width: 100%" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleTagClosed(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加标签按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  type="primary"
                  @click="showInput(scope.row)"
                  >添加标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作" width="190">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editAttr(scope.row.attr_id)"
                >
                  编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteAttr(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table></el-tab-pane
        >
      </el-tabs>
    </el-card>
    <!-- 添加动态参数、静态属性弹框 -->
    <el-dialog
      :title="'添加' + labelText"
      :visible.sync="isAddDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addRef"
        label-width="100px"
      >
        <el-form-item :label="labelText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttrForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑动态参数、静态属性弹框 -->
    <el-dialog
      :title="'编辑' + labelText"
      :visible.sync="isEditDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRef"
        label-width="100px"
      >
        <el-form-item :label="labelText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditAttrForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      selectedKeys: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      activeName: 'many',
      manyData: [],
      onlyData: [],
      isAddDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addRules: {
        attr_name: [
          {
            required: true,
            message: `请输入内容`,
            trigger: 'blur',
          },
        ],
      },
      editForm: {
        attr_name: '',
        attr_id: '',
      },
      isEditDialogVisible: false,
      editRules: {
        attr_name: [
          {
            required: true,
            message: `请输入内容`,
            trigger: 'blur',
          },
        ],
      },
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories');

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败');
      }
      this.cateList = res.data;
    },
    handleChange() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyData = [];
        this.onlyData = [];
        return;
      }
      //证明是三级分类
      this.getCateAttribute();
      // console.log(this.selectedKeys);
    },
    handleClick() {
      if (this.selectedKeys.length !== 3) {
        return;
      }
      this.getCateAttribute();
    },

    // 获取分类参数数据
    async getCateAttribute() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败');
      }
      //把字符串变成数组，渲染成页面中的tag标签
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        item.inputVisible = false;
        item.inputValue = '';
      });

      if (this.activeName === 'many') {
        this.manyData = res.data;
      } else {
        this.onlyData = res.data;
      }
    },
    addAttr() {
      this.isAddDialogVisible = true;
    },
    addDialogClosed() {
      this.$refs.addRef.resetFields();
    },
    addAttrForm() {
      this.$refs.addRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.labelText + '失败');
        }
        this.$message.success('添加' + this.labelText + '成功');
        this.isAddDialogVisible = false;
        this.getCateAttribute();
      });
    },
    async editAttr(attrId) {
      this.editForm.attr_id = attrId;
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('获取' + this.labelText + '信息失败');
      }

      this.editForm.attr_name = res.data.attr_name;
      this.isEditDialogVisible = true;
    },
    editDialogClosed() {
      this.$refs.editRef.resetFields();
    },
    EditAttrForm() {
      this.$refs.editRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数信息失败');
        }
        this.$message.success('修改参数成功');
        this.getCateAttribute();
        this.isEditDialogVisible = false;
      });
    },
    async deleteAttr(attrId) {
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err);
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败');
        }
        this.$message.success('删除参数成功');
        this.getCateAttribute();
      }
      if (result === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      }
    },
    async handleInputConfirm(row) {
      console.log(row.inputValue.trim());
      if (row.inputValue.trim() === '') {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      //填写内容合法
      row.attr_vals.push(row.inputValue);
      row.inputValue = '';
      row.inputVisible = false;
      this.setTag(row);
    },
    async setTag(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' '),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败');
      }
      this.$message.success('修改参数成功');
    },
    showInput(row) {
      row.inputVisible = true;
      //文本框自动获取焦点

      this.$nextTick((_) => {
        this.$refs.saveTagInput.focus();
      });
    },
    handleTagClosed(i, row) {
      row.attr_vals.splice(i, 1);
      this.setTag(row);
    },
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return;
    },
    labelText() {
      if (this.activeName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    },
  },
  created() {
    this.getCateList();
  },
};
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 15px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
