<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">商品分类</el-button>
        </el-col>
      </el-row>
      <table-tree
        :data="goodsCateList"
        tree-type
        :columns="columns"
        :selection-type="false"
        show-index
        index-text="#"
        :expand-type="false"
        border
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: green"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="option" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editCateInfo(scope.row.cat_id)"
          >
            编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCateInfo(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </table-tree>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="paramsInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="paramsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateFormClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="parentCateSelected"
            :options="parentCateList"
            :props="props"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateFormClosed"
    >
      <el-form
        ref="editCateFormRef"
        :rules="editCateFormRules"
        :model="editCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="editCateName">
          <el-input v-model="editCateForm.editCateName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      paramsInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      goodsCateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'option',
          width: '190px',
        },
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      parentCateList: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },

      parentCateSelected: [],
      editCateDialogVisible: false,
      editCateForm: {
        editCateName: '',
        editCateId: 0,
      },
      editCateFormRules: {
        editCateName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    async getGoodsCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.paramsInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败');
      }
      this.goodsCateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newPagesize) {
      this.paramsInfo.pagesize = newPagesize;
      this.getGoodsCateList();
    },
    handleCurrentChange(newPagenum) {
      this.paramsInfo.pagenum = newPagenum;
      this.getGoodsCateList();
    },
    async showAddCate() {
      //获取父级分类列表
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败');
      }
      this.parentCateList = res.data;
      this.addCateDialogVisible = true;
    },
    handleChange() {
      if (this.parentCateSelected.length > 0) {
        this.addCateForm.cat_pid =
          this.parentCateSelected[this.parentCateSelected.length - 1];
        this.addCateForm.cat_level = this.parentCateSelected.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //对话框关闭重置表单数据
    addCateFormClosed() {
      this.parentCateSelected = [];
      this.$refs.addCateFormRef.resetFields();
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败');
        }
        this.$message.success('添加分类成功');
        this.getGoodsCateList();
        this.addCateDialogVisible = false;
      });
    },
    async editCateInfo(cateId) {
      this.editCateForm.editCateId = cateId;
      const { data: res } = await this.$http.get('categories/' + cateId);
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败');
      }
      this.editCateForm.editCateName = res.data.cat_name;
      this.editCateDialogVisible = true;
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.editCateId,
          { cat_name: this.editCateForm.editCateName }
        );

        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败');
        }
        this.$message.success('修改分类成功');
        this.getGoodsCateList();

        this.editCateDialogVisible = false;
      });
    },
    editCateFormClosed() {
      this.editCateForm.editCateId = 0;
      this.editCateForm.editCateName = '';
    },
    async deleteCateInfo(cateId) {
      const result = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err);
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete('categories/' + cateId);
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败');
        }
        this.$message.success('删除分类成功');
        this.getGoodsCateList();
      }
      if (result === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      }
    },
  },
  created() {
    this.getGoodsCateList();
  },
};
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
