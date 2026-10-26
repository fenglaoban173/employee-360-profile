<template>
  <div class="employee-profile-page">
    <!-- ========== 总览指标 ========== -->
    <a-row :gutter="16" class="stats-row">
      <a-col :flex="1">
        <StatCard
          icon="user-group"
          theme="primary"
          label="员工档案总数"
          :value="stats.total"
          unit="人"
        />
      </a-col>
      <a-col :flex="1">
        <StatCard
          icon="check-circle"
          theme="success"
          label="在职"
          :value="stats.active"
          unit="人"
        />
      </a-col>
      <a-col :flex="1">
        <StatCard
          icon="clock-circle"
          theme="warning"
          label="试用期"
          :value="stats.probation - stats.internProbation"
          unit="人"
        />
      </a-col>
      <a-col :flex="1">
        <StatCard
          icon="history"
          theme="cyan"
          label="实习期"
          :value="stats.internProbation"
          unit="人"
        />
      </a-col>
      <a-col :flex="1">
        <StatCard
          icon="star"
          theme="purple"
          label="本月新入职"
          :value="stats.newThisMonth"
          unit="人"
        />
      </a-col>
      <a-col :flex="1">
        <StatCard
          icon="export"
          theme="error"
          label="本月离职"
          :value="stats.resignedThisMonth"
          unit="人"
        />
      </a-col>
    </a-row>

    <!-- ========== 筛选区 ========== -->
    <a-card class="filter-card" :bordered="false">
      <!-- 快速筛选 -->
      <div class="quick-filter-row">
        <a-tabs
          v-model:active-key="quickFilter"
          type="line"
          class="quick-filter-tabs"
        >
          <a-tab-pane v-for="f in quickFilters" :key="f.value">
            <template #title>
              <span class="tab-title-text">{{ f.label }}</span>
              <span class="tab-title-count">{{ f.count }}</span>
            </template>
          </a-tab-pane>
        </a-tabs>
        <div class="quick-filter-right">
          <a-tabs
            v-model:active-key="workLocationFilter"
            type="line"
            class="quick-filter-tabs quick-filter-tabs-right"
          >
            <a-tab-pane v-for="f in workLocationFilters" :key="f.value">
              <template #title>
                <span class="tab-title-text">{{ f.label }}</span>
                <span class="tab-title-count">{{ f.count }}</span>
              </template>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <a-row :gutter="16" align="center">
        <a-col :span="5">
          <a-select
            v-model="filters.keyword"
            placeholder="搜索姓名"
            allow-clear
            filterable
            style="width: 100%"
          >
            <template #prefix><icon-search /></template>
            <a-option
              v-for="e in employeeSearchOptions"
              :key="e.id"
              :value="e.name"
            >
              {{ e.name }} <span style="color: var(--color-neutral-5)">（{{ e.employeeNo }} · {{ e.department }}）</span>
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="filters.employeeCategory"
            placeholder="员工类别"
            allow-clear
            style="width: 100%"
          >
            <a-option v-for="c in employeeCategories" :key="c" :value="c">
              {{ c }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-select
            v-model="filters.department"
            placeholder="部门"
            allow-clear
            style="width: 100%"
          >
            <a-option v-for="d in departments" :key="d" :value="d">
              {{ d }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model="filters.dateRange"
            :placeholder="['入职日期 起', '入职日期 止']"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model="filters.departureDateRange"
            :placeholder="['离职日期 起', '离职日期 止']"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="4" class="filter-actions">
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            查询
          </a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- ========== 列表区 ========== -->
    <a-card
      class="list-card"
      :bordered="false"
    >
      <template #title>
        <div class="list-card-title">
          <a-button
            type="primary"
            size="small"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchExport"
          >
            <template #icon><icon-export /></template>
            批量导出
          </a-button>
          <a-button
            size="small"
            status="danger"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchDelete"
          >
            <template #icon><icon-delete /></template>
            批量删除
          </a-button>
          <span v-if="selectedRowKeys.length" class="selected-tip is-active">
            已选 {{ selectedRowKeys.length }} 项
          </span>
          <a-link
            v-if="selectedRowKeys.length"
            class="clear-selection"
            @click="clearSelection"
          >
            取消选择
          </a-link>
        </div>
      </template>
      <template #extra>
        <a-button type="primary" @click="openAddDrawer">
          <template #icon><icon-plus /></template>
          添加员工档案
        </a-button>
      </template>
      <a-table
        v-model:selected-keys="selectedRowKeys"
        :data="filteredList"
        :pagination="{ pageSize: 10, showTotal: true }"
        row-key="id"
        :columns="columns"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      >
        <template #name="{ record }">
          <div class="table-name-cell" @click="viewEmployee(record)">
            <a-avatar :size="32" class="employee-avatar">
              <img :src="record.avatar" :alt="record.name" />
            </a-avatar>
            <a-link class="table-name">{{ record.name }}</a-link>
          </div>
        </template>
        <template #phone="{ record, rowIndex }">
          <span
            class="phone-revealable"
            @mouseenter="revealedPhoneIndex = rowIndex"
            @mouseleave="revealedPhoneIndex = null"
          >
            <icon-eye class="reveal-icon" />
            <span class="reveal-text">
              {{ revealedPhoneIndex === rowIndex ? record.phone : maskPhone(record.phone) }}
            </span>
          </span>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)" size="small">
            {{ statusText(record.status, record.employeeCategory) }}
          </a-tag>
        </template>
        <template #departureDate="{ record }">
          <span class="cell-muted">{{ record.departureDate || '—' }}</span>
        </template>
        <template #actions="{ record }">
          <span class="row-actions">
            <a-button type="text" size="small" @click="viewEmployee(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-button type="text" size="small" @click="openEditDrawer(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-button
              type="text"
              status="danger"
              size="small"
              @click="confirmDeleteSingle(record)"
            >
              <template #icon><icon-delete /></template>
              删除
            </a-button>
          </span>
        </template>
      </a-table>
    </a-card>

    <!-- ========== 添加员工抽屉 ========== -->
    <a-drawer
      v-model:visible="addDrawerVisible"
      :title="drawerTitle"
      placement="right"
      :width="940"
      :ok-text="drawerOkText"
      :cancel-text="'取消'"
      :mask-closable="false"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <div class="add-form">
        <!-- 顶部：岗位信息 -->
        <div class="form-section-title">岗位信息</div>
        <a-row :gutter="16" class="form-row form-row-top">
          <a-col :span="12">
            <a-form-item label="部门" required>
              <a-select v-model="addForm.department" placeholder="请选择部门" allow-clear>
                <a-option v-for="d in departments" :key="d" :value="d">{{ d }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="岗位" required>
              <a-input v-model="addForm.position" placeholder="请输入岗位" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="工作地点">
              <a-input v-model="addForm.workLocation" placeholder="请输入工作地点" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="合同类型">
              <a-select v-model="addForm.contractType" placeholder="请选择合同类型" allow-clear>
                <a-option v-for="c in contractTypeOptions" :key="c" :value="c">{{ c }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <div class="form-section-title">基本信息</div>

        <!-- 基本信息：左边一栏 + 右边照片 -->
        <div class="form-basic">
          <div class="form-basic-fields">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="姓名" required>
                  <a-input v-model="addForm.name" placeholder="请输入姓名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="性别" required>
                  <a-radio-group v-model="addForm.gender">
                    <a-radio value="男">男</a-radio>
                    <a-radio value="女">女</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="民族">
                  <a-input v-model="addForm.ethnicity" placeholder="如：汉族" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="学历">
                  <a-select v-model="addForm.degree" placeholder="请选择学历" allow-clear>
                    <a-option v-for="d in degreeOptions" :key="d" :value="d">{{ d }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="出生日期">
                  <a-date-picker v-model="addForm.birthDate" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="联系电话">
                  <a-input v-model="addForm.phone" placeholder="请输入联系电话" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="婚姻状况">
                  <a-radio-group v-model="addForm.maritalStatus">
                    <a-radio value="未婚">未婚</a-radio>
                    <a-radio value="已婚">已婚</a-radio>
                    <a-radio value="离异">离异</a-radio>
                    <a-radio value="丧偶">丧偶</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="现在住址">
                  <a-input v-model="addForm.address" placeholder="请输入现在住址" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="紧急情况联系人">
                  <a-input v-model="addForm.emergencyContact" placeholder="姓名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="紧急情况联系电话">
                  <a-input v-model="addForm.emergencyPhone" placeholder="电话" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="户藉地址">
                  <a-input v-model="addForm.hukouAddress" placeholder="请输入户籍地址" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="身份证号">
                  <a-input v-model="addForm.idCard" placeholder="请输入身份证号" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="电子邮箱">
                  <a-input v-model="addForm.email" placeholder="请输入邮箱" />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
          <div class="form-basic-photo">
            <div class="photo-frame">
              <icon-user v-if="!addForm.photo" class="photo-placeholder" />
              <img v-else :src="addForm.photo" alt="照片" />
            </div>
            <a-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handlePhotoChange"
            >
              <a-button size="small" style="margin-top: 8px">
                <template #icon><icon-upload /></template>
                上传照片
              </a-button>
            </a-upload>
          </div>
        </div>

        <div class="form-section-title">教育经历</div>
        <div class="form-table">
          <div class="form-table-head">
            <span>起止日期</span>
            <span>学历/学位</span>
            <span>毕业学校</span>
            <span>专业</span>
            <span class="form-table-op"></span>
          </div>
          <div
            v-for="(row, idx) in addForm.educationHistory"
            :key="idx"
            class="form-table-row"
          >
            <a-range-picker v-model="row.period" style="width: 100%" />
            <a-input v-model="row.degree" placeholder="如：本科" />
            <a-input v-model="row.school" placeholder="毕业学校" />
            <a-input v-model="row.major" placeholder="所学专业" />
            <a-button
              type="text"
              status="danger"
              size="mini"
              @click="removeTableRow('educationHistory', idx)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
          <a-button
            type="dashed"
            long
            size="small"
            @click="addTableRow('educationHistory')"
          >
            <template #icon><icon-plus /></template>
            添加教育经历
          </a-button>
        </div>

        <div class="form-section-title">主要家庭成员</div>
        <div class="form-table">
          <div class="form-table-head">
            <span>成员关系</span>
            <span>姓名</span>
            <span>工作单位</span>
            <span>电话</span>
            <span class="form-table-op"></span>
          </div>
          <div
            v-for="(row, idx) in addForm.family"
            :key="idx"
            class="form-table-row"
          >
            <a-input v-model="row.relation" placeholder="如：父亲" />
            <a-input v-model="row.name" placeholder="姓名" />
            <a-input v-model="row.company" placeholder="工作单位" />
            <a-input v-model="row.phone" placeholder="电话" />
            <a-button
              type="text"
              status="danger"
              size="mini"
              @click="removeTableRow('family', idx)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
          <a-button
            type="dashed"
            long
            size="small"
            @click="addTableRow('family')"
          >
            <template #icon><icon-plus /></template>
            添加家庭成员
          </a-button>
        </div>

        <div class="form-section-title">工作经历</div>
        <div class="form-table">
          <div class="form-table-head form-table-row-7">
            <span>起止日期</span>
            <span>工作单位</span>
            <span>职务</span>
            <span>证明人</span>
            <span>证明人电话</span>
            <span>离职原因</span>
            <span class="form-table-op"></span>
          </div>
          <div
            v-for="(row, idx) in addForm.workHistory"
            :key="idx"
            class="form-table-row form-table-row-7"
          >
            <a-range-picker v-model="row.period" style="width: 100%" />
            <a-input v-model="row.company" placeholder="工作单位" />
            <a-input v-model="row.title" placeholder="职务" />
            <a-input v-model="row.reference" placeholder="证明人姓名" />
            <a-input v-model="row.referencePhone" placeholder="电话" />
            <a-input v-model="row.reason" placeholder="离职原因" />
            <a-button
              type="text"
              status="danger"
              size="mini"
              @click="removeTableRow('workHistory', idx)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
          <a-button
            type="dashed"
            long
            size="small"
            @click="addTableRow('workHistory')"
          >
            <template #icon><icon-plus /></template>
            添加工作经历
          </a-button>
        </div>

        <div class="form-section-title">劳动关系</div>
        <a-form-item label="是否与原单位解除劳动合同">
          <a-radio-group v-model="addForm.contractReleased">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>
    </a-drawer>

    <!-- ========== 通用删除确认弹窗（页面正中居中） ========== -->
    <a-modal
      v-model:visible="deleteConfirmVisible"
      :title="deleteConfirmTitle"
      :ok-text="'确认删除'"
      :cancel-text="'取消'"
      :ok-button-props="{ status: 'danger' }"
      :mask-closable="false"
      @ok="handleDeleteConfirmOk"
      @cancel="handleDeleteConfirmCancel"
    >
      <div class="delete-confirm-body">
        <icon-exclamation-circle class="delete-confirm-icon" />
        <span class="delete-confirm-text">{{ deleteConfirmContent }}</span>
      </div>
    </a-modal>

    <!-- ========== 批量导出弹窗（顶：统一配置横排 / 底：已选员工 + 按员工微调） ========== -->
    <a-modal
      v-model:visible="batchExportVisible"
      title="批量导出员工档案"
      :ok-text="`确认导出 (${selectedRowKeys.length})`"
      :cancel-text="'取消'"
      :ok-button-props="{ disabled: !selectedRowKeys.length || batchExporting, loading: batchExporting }"
      :mask-closable="false"
      :width="960"
      @ok="confirmBatchExport"
      @cancel="handleBatchExportCancel"
    >
      <div class="batch-export-body">
        <!-- 顶部：统一配置（横排 13 项） -->
        <div class="batch-export-block batch-export-unified">
          <div class="batch-export-block-header">
            <span class="batch-export-block-title">
              统一配置
              <span class="batch-export-block-subtitle">
                （应用到 {{ selectedRowKeys.length }} 位员工）
              </span>
            </span>
            <span class="batch-export-toolbar">
              <a-link @click="selectAllUnified">全选</a-link>
              <a-divider direction="vertical" :margin="4" />
              <a-link @click="invertUnified">反选</a-link>
              <a-divider direction="vertical" :margin="4" />
              <a-link @click="clearUnified">清空</a-link>
            </span>
          </div>
          <div class="batch-export-block-body batch-export-horizontal">
            <a-checkbox-group v-model="unifiedExportCategories">
              <a-checkbox
                v-for="cat in attachmentCategoryOptions"
                :key="cat"
                :value="cat"
              >
                {{ cat }}
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </div>

        <!-- 底部：左 已选员工 + 右 按员工微调 -->
        <div class="batch-export-bottom-row">
          <!-- 左侧：已选员工 -->
          <div class="batch-export-block batch-export-left">
            <div class="batch-export-block-header">
              <span class="batch-export-block-title">已选员工</span>
              <span class="batch-export-count">{{ selectedRowKeys.length }} 人</span>
            </div>
            <div class="batch-export-employee-list">
              <div
                v-for="emp in selectedEmployees"
                :key="emp.id"
                :class="[
                  'batch-export-employee-item',
                  { 'is-active': emp.id === activeExportEmployeeId },
                ]"
                @click="selectEmployee(emp.id)"
              >
                <a-avatar :size="32" class="employee-avatar">
                  <img :src="emp.avatar" :alt="emp.name" />
                </a-avatar>
                <div class="batch-export-employee-info">
                  <div class="batch-export-employee-name-row">
                    <span class="batch-export-employee-name">{{ emp.name }}</span>
                    <a-tag
                      v-if="emp.id in employeeCategorySelections"
                      size="small"
                      color="arcoblue"
                      class="batch-export-employee-tag"
                    >
                      已自定义
                    </a-tag>
                    <a-tag
                      v-else
                      size="small"
                      color="gray"
                      class="batch-export-employee-tag"
                    >
                      沿用统一
                    </a-tag>
                  </div>
                  <div class="batch-export-employee-meta">
                    {{ emp.department }} · {{ emp.position }}
                  </div>
                  <div class="batch-export-employee-categories">
                    最终 {{ getEmployeeFinalCategories(emp.id).length }} 项
                  </div>
                </div>
                <a-button
                  type="text"
                  size="small"
                  class="batch-export-remove-btn"
                  title="从已选中移除"
                  @click.stop="removeFromBatchExport(emp.id)"
                >
                  <template #icon><icon-close /></template>
                </a-button>
              </div>
              <a-empty
                v-if="!selectedEmployees.length"
                description="暂未选择员工"
                :image-size="64"
              />
            </div>
          </div>

          <!-- 右侧：按员工微调 -->
          <div class="batch-export-block batch-export-right">
            <div class="batch-export-block-header">
              <span class="batch-export-block-title">
                按员工微调
                <span v-if="activeExportEmployee" class="batch-export-block-subtitle">
                  - {{ activeExportEmployee.name }}
                </span>
                <span
                  v-if="isCurrentEmployeeCustomized"
                  class="batch-export-block-tag"
                >
                  已自定义
                </span>
                <span
                  v-else
                  class="batch-export-block-tag is-default"
                >
                  沿用统一
                </span>
              </span>
              <span class="batch-export-toolbar">
                <a-link
                  v-if="isCurrentEmployeeCustomized"
                  @click="resetCurrentEmployeeToUnified"
                >
                  重置为统一
                </a-link>
                <a-divider
                  v-if="isCurrentEmployeeCustomized"
                  direction="vertical"
                  :margin="4"
                />
                <a-link @click="selectAllCategories">全选</a-link>
                <a-divider direction="vertical" :margin="4" />
                <a-link @click="invertCategories">反选</a-link>
                <a-divider direction="vertical" :margin="4" />
                <a-link @click="clearCategories">清空</a-link>
              </span>
            </div>
            <div class="batch-export-block-body">
              <a-checkbox-group
                v-if="activeExportEmployee"
                v-model="activeExportCategories"
                direction="vertical"
              >
                <a-checkbox
                  v-for="cat in attachmentCategoryOptions"
                  :key="cat"
                  :value="cat"
                >
                  {{ cat }}
                </a-checkbox>
              </a-checkbox-group>
              <a-empty
                v-else
                description="请点击左侧员工切换"
                :image-size="48"
              />
            </div>
          </div>
        </div>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import StatCard from '@/components/StatCard.vue'
import {
  IconSearch,
  IconEye,
  IconPlus,
  IconUpload,
  IconDelete,
  IconUser,
  IconExport,
  IconEdit,
  IconExclamationCircle,
  IconClose,
} from '@arco-design/web-vue/es/icon'
import {
  employees,
  type Employee,
  contractTypeOptions,
  attachmentCategoryOptions,
  type AttachmentCategory,
} from './data'
import { employeeStatusText, maskPhone } from '@/utils/format'
import { downloadBatchExport } from '@/utils/batchExport'

const departments = [
  '技术部',
  '产品部',
  '设计部',
  '运营部',
  '人力资源部',
  '市场部',
  '财务部',
]

/** 员工类别下拉选项（与 data.ts 中的 employeeCategory 字段保持一致） */
const employeeCategories = [
  '正式员工',
  '实习生员工',
  '劳务派遣员工',
  '外包员工',
  '兼职员工',
]

/** 搜索下拉的候选项：来自员工列表的 姓名/工号/部门 */
const employeeSearchOptions = computed(() =>
  list.map(e => ({
    id: e.id,
    name: e.name,
    employeeNo: e.employeeNo,
    department: e.department,
  }))
)

const list = employees

const stats = computed(() => {
  const total = list.length
  const active = list.filter(e => e.status === 'active').length
  const probation = list.filter(e => e.status === 'probation').length
  const internProbation = list.filter(e => e.status === 'probation' && e.employeeCategory === '实习生员工').length
  const leave = list.filter(e => e.status === 'leave').length
  const resigned = list.filter(e => e.status === 'resigned').length
  const newThisMonth = list.filter(e => {
    const d = new Date(e.entryDate)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  return { total, active, probation, internProbation, leave, resigned, newThisMonth, resignedThisMonth: resigned }
})

const filters = reactive({
  keyword: '',
  employeeCategory: undefined as string | undefined,
  department: undefined as string | undefined,
  dateRange: undefined as string[] | undefined,
  departureDateRange: undefined as string[] | undefined,
})

type QuickFilterValue = 'all' | 'active' | 'probation' | 'intern' | 'leave' | 'resigned'

const quickFilter = ref<QuickFilterValue>('all')

const quickFilters = computed(() => [
  { value: 'all' as QuickFilterValue, label: '全部', count: stats.value.total },
  { value: 'active' as QuickFilterValue, label: '在职', count: stats.value.active + stats.value.probation },
  { value: 'probation' as QuickFilterValue, label: '试用期', count: stats.value.probation - stats.value.internProbation },
  { value: 'intern' as QuickFilterValue, label: '实习期', count: stats.value.internProbation },
  { value: 'resigned' as QuickFilterValue, label: '离职', count: stats.value.resigned },
])

/** 工作地点页签（右侧的二级快速筛选） */
type WorkLocationFilterValue = 'all' | '北京' | '上海' | '成都' | '深圳'

const workLocationFilter = ref<WorkLocationFilterValue>('all')

const workLocationFilters = computed(() => [
  { value: 'all' as WorkLocationFilterValue, label: '全部', count: list.length },
  { value: '北京' as WorkLocationFilterValue, label: '北京', count: list.filter(e => e.workLocation === '北京').length },
  { value: '上海' as WorkLocationFilterValue, label: '上海', count: list.filter(e => e.workLocation === '上海').length },
  { value: '成都' as WorkLocationFilterValue, label: '成都', count: list.filter(e => e.workLocation === '成都').length },
  { value: '深圳' as WorkLocationFilterValue, label: '深圳', count: list.filter(e => e.workLocation === '深圳').length },
])

const filteredList = computed(() => {
  return list.filter(e => {
    if (quickFilter.value !== 'all') {
      const intern = e.employeeCategory === '实习生员工'
      let hit: boolean
      if (quickFilter.value === 'active') {
        // 「在职」口径 = 已转正 + 试用期/实习期（未离职的都算在职）
        hit = e.status === 'active' || e.status === 'probation'
      } else if (quickFilter.value === 'intern') {
        // 「实习期」只取实习生的 probation；其余 probation 走「试用期」
        hit = e.status === 'probation' && intern
      } else if (quickFilter.value === 'probation') {
        hit = e.status === 'probation' && !intern
      } else {
        hit = e.status === quickFilter.value
      }
      if (!hit) return false
    }
    if (workLocationFilter.value !== 'all' && e.workLocation !== workLocationFilter.value) return false
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      if (
        !e.name.toLowerCase().includes(kw) &&
        !e.employeeNo.toLowerCase().includes(kw) &&
        !e.email.toLowerCase().includes(kw)
      ) return false
    }
    if (filters.employeeCategory && e.employeeCategory !== filters.employeeCategory) return false
    if (filters.department && e.department !== filters.department) return false
    if (filters.dateRange && filters.dateRange.length === 2) {
      const entry = new Date(e.entryDate).getTime()
      const start = new Date(filters.dateRange[0]).getTime()
      const end = new Date(filters.dateRange[1]).getTime()
      if (entry < start || entry > end) return false
    }
    if (filters.departureDateRange && filters.departureDateRange.length === 2) {
      if (!e.departureDate) return false
      const dep = new Date(e.departureDate).getTime()
      const start = new Date(filters.departureDateRange[0]).getTime()
      const end = new Date(filters.departureDateRange[1]).getTime()
      if (dep < start || dep > end) return false
    }
    return true
  })
})

const columns = [
  { title: '姓名', dataIndex: 'name', slotName: 'name', width: 90 },
  { title: '手机号', dataIndex: 'phone', slotName: 'phone', width: 130 },
  { title: '部门', dataIndex: 'department', width: 90 },
  { title: '岗位', dataIndex: 'position', width: 100 },
  { title: '工作地点', dataIndex: 'workLocation', width: 90 },
  { title: '在职状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '员工类别', dataIndex: 'employeeCategory', width: 100 },
  { title: '入职日期', dataIndex: 'entryDate', width: 110 },
  { title: '离职日期', dataIndex: 'departureDate', slotName: 'departureDate', width: 110 },
  { title: '操作', slotName: 'actions', width: 200, fixed: 'right' as const },
]

/* ===== 批量操作：勾选 + 操作按钮 =====
 * Arco Vue 的 a-table 用 v-model:selectedKeys 双向绑定，
 * 直接把 ref 传过去即可，无需再用 reactive/watch 同步。
 */
const selectedRowKeys = ref<number[]>([])

const clearSelection = () => {
  selectedRowKeys.value = []
}

const handleBatchExport = () => {
  if (!selectedRowKeys.value.length) {
    Message.warning('请先勾选要导出的员工')
    return
  }
  // 1) 清理掉已不在勾选列表中的员工配置
  Object.keys(employeeCategorySelections).forEach(k => {
    const id = Number(k)
    if (!selectedRowKeys.value.includes(id)) {
      delete employeeCategorySelections[id]
    }
  })
  // 2) 不再为新员工预初始化；未自定义的员工会自然 fallback 到 unifiedExportCategories
  // 3) 默认激活第一位员工
  if (
    activeExportEmployeeId.value === null ||
    !selectedRowKeys.value.includes(activeExportEmployeeId.value)
  ) {
    activeExportEmployeeId.value = selectedRowKeys.value[0] ?? null
  }
  batchExportVisible.value = true
}

/* ========== 批量导出弹窗（右：统一配置 + 按员工微调 两块并存） ========== */
const batchExportVisible = ref(false)

/** 统一配置：应用到所有未自定义的员工。默认空数组。 */
const unifiedExportCategories = ref<AttachmentCategory[]>([])

/** 每位员工的微调配置：{ [employeeId]: AttachmentCategory[] } */
const employeeCategorySelections = reactive<Record<number, AttachmentCategory[]>>({})

/** 当前右侧微调区显示的是哪位员工（点击左侧员工切换） */
const activeExportEmployeeId = ref<number | null>(null)

/** 已选员工列表 */
const selectedEmployees = computed(() =>
  selectedRowKeys.value
    .map(id => employees.find(e => e.id === id))
    .filter((e): e is Employee => e !== undefined),
)

/** 当前激活的员工对象 */
const activeExportEmployee = computed(() =>
  selectedEmployees.value.find(e => e.id === activeExportEmployeeId.value) || null,
)

/** 当前激活员工是否已自定义（用于显示「重置为统一配置」按钮） */
const isCurrentEmployeeCustomized = computed(() => {
  if (activeExportEmployeeId.value === null) return false
  return activeExportEmployeeId.value in employeeCategorySelections
})

/** 取得员工的最终导出项：微调优先，否则用统一配置 */
const getEmployeeFinalCategories = (id: number): AttachmentCategory[] => {
  return employeeCategorySelections[id] ?? unifiedExportCategories.value
}

/** 微调区 v-model：get 时 fallback 到统一配置，set 时写入员工自己的配置（即标记为已自定义） */
const activeExportCategories = computed<AttachmentCategory[]>({
  get() {
    if (activeExportEmployeeId.value === null) return []
    return getEmployeeFinalCategories(activeExportEmployeeId.value)
  },
  set(value) {
    if (activeExportEmployeeId.value === null) return
    employeeCategorySelections[activeExportEmployeeId.value] = [...value]
  },
})

/** 切换右侧显示的员工 */
const selectEmployee = (id: number) => {
  activeExportEmployeeId.value = id
}

/** 移除单条员工（若被移除的是当前激活员工，则切换到列表首位） */
const removeFromBatchExport = (id: number) => {
  selectedRowKeys.value = selectedRowKeys.value.filter(k => k !== id)
  if (activeExportEmployeeId.value === id) {
    activeExportEmployeeId.value = selectedRowKeys.value[0] ?? null
  }
}

/** 重置当前员工为统一配置（清除其微调） */
const resetCurrentEmployeeToUnified = () => {
  if (activeExportEmployeeId.value === null) return
  delete employeeCategorySelections[activeExportEmployeeId.value]
}

/* ----- 统一配置 工具栏 ----- */
const selectAllUnified = () => {
  unifiedExportCategories.value = [...attachmentCategoryOptions]
}
const invertUnified = () => {
  unifiedExportCategories.value = attachmentCategoryOptions.filter(
    cat => !unifiedExportCategories.value.includes(cat),
  )
}
const clearUnified = () => {
  unifiedExportCategories.value = []
}

/* ----- 按员工微调 工具栏（作用于当前激活员工） ----- */
const selectAllCategories = () => {
  if (activeExportEmployeeId.value === null) return
  employeeCategorySelections[activeExportEmployeeId.value] = [...attachmentCategoryOptions]
}
const invertCategories = () => {
  if (activeExportEmployeeId.value === null) return
  const id = activeExportEmployeeId.value
  const current = getEmployeeFinalCategories(id)
  employeeCategorySelections[id] = attachmentCategoryOptions.filter(
    cat => !current.includes(cat),
  )
}
const clearCategories = () => {
  if (activeExportEmployeeId.value === null) return
  employeeCategorySelections[activeExportEmployeeId.value] = []
}

/** 是否正在生成 zip（用于禁用 OK 按钮） */
const batchExporting = ref(false)

/** 确认导出：真实生成 zip 并触发浏览器下载 */
const confirmBatchExport = async () => {
  if (batchExporting.value) return
  if (!selectedRowKeys.value.length) {
    Message.warning('请至少勾选 1 位员工')
    return
  }
  // 检查每位员工的最终导出项是否 ≥ 1
  const emptyIds = selectedRowKeys.value.filter(
    id => getEmployeeFinalCategories(id).length === 0,
  )
  if (emptyIds.length) {
    const names = emptyIds
      .map(id => employees.find(e => e.id === id)?.name)
      .filter(Boolean)
      .join('、')
    Message.warning(`以下员工无任何导出项：${names}`)
    return
  }

  // 关闭弹窗 + 全局 loading
  batchExportVisible.value = false
  batchExporting.value = true
  const loadingMsg = Message.loading('正在生成 ZIP 文件...')

  try {
    const result = await downloadBatchExport({
      employees: selectedEmployees.value,
      employeeSelections: { ...employeeCategorySelections },
      unifiedCategories: unifiedExportCategories.value,
    })
    loadingMsg.close()
    Message.success(
      `已导出 ${selectedRowKeys.value.length} 位员工档案，共 ${result.fileCount} 份文件（含 ${result.excelCount} 份 Excel）（${result.zipName}）`,
    )
  } catch (err) {
    loadingMsg.close()
    Message.error('导出失败：' + (err instanceof Error ? err.message : String(err)))
    // 失败时让用户重试：重新打开弹窗
    batchExportVisible.value = true
  } finally {
    batchExporting.value = false
  }
}

const handleBatchExportCancel = () => {
  batchExportVisible.value = false
}

const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) {
    Message.warning('请先勾选要删除的员工')
    return
  }
  const count = selectedRowKeys.value.length
  requestDeleteConfirm(
    '批量删除员工档案',
    `确定要删除已勾选的 ${count} 位员工档案吗？此操作不可恢复，请谨慎操作。`,
    () => {
      // 实际项目：调用后端批量删除接口
      const ids = [...selectedRowKeys.value]
      // 从 reactive 数组里移除（mock 环境：按 id 过滤）
      const idxs = ids
        .map(id => employees.findIndex(e => e.id === id))
        .filter(i => i >= 0)
        .sort((a, b) => b - a) // 从后往前删，避免下标错位
      idxs.forEach(i => employees.splice(i, 1))
      Message.success(`已删除 ${count} 位员工档案`)
      clearSelection()
    },
  )
}

/* ========== 通用删除确认弹窗（页面正中居中） ========== */
const deleteConfirmVisible = ref(false)
const deleteConfirmTitle = ref('确认删除')
const deleteConfirmContent = ref('')
let pendingDeleteAction: (() => void) | null = null

const requestDeleteConfirm = (
  title: string,
  content: string,
  action: () => void,
) => {
  deleteConfirmTitle.value = title
  deleteConfirmContent.value = content
  pendingDeleteAction = action
  deleteConfirmVisible.value = true
}

const handleDeleteConfirmOk = () => {
  if (pendingDeleteAction) pendingDeleteAction()
  deleteConfirmVisible.value = false
  pendingDeleteAction = null
}

const handleDeleteConfirmCancel = () => {
  deleteConfirmVisible.value = false
  pendingDeleteAction = null
}

/** 单个删除：表格「操作」列的删除按钮 */
const confirmDeleteSingle = (record: Employee) => {
  requestDeleteConfirm(
    '删除员工档案',
    `确定要删除员工「${record.name}」的档案吗？此操作不可恢复，请谨慎操作。`,
    () => {
      const idx = employees.findIndex(e => e.id === record.id)
      if (idx >= 0) {
        employees.splice(idx, 1)
        Message.success(`已删除员工：${record.name}`)
      }
    },
  )
}

const router = useRouter()

/** 列表行 hover 揭示手机号：同一时刻只可能有一行处于揭示态，记录其行 index */
const revealedPhoneIndex = ref<number | null>(null)

const viewEmployee = (record: Employee) => {
  router.push(`/employee-profile/${record.id}`)
}

const handleSearch = () => {
  // 响应式 computed 会自动更新
  clearSelection()
}
const handleReset = () => {
  filters.keyword = ''
  filters.employeeCategory = undefined
  filters.department = undefined
  filters.dateRange = undefined
  filters.departureDateRange = undefined
  quickFilter.value = 'all'
  clearSelection()
  workLocationFilter.value = 'all'
}

const statusText = (s: Employee['status'], category?: string) =>
  employeeStatusText(s, category)
const statusColor = (s: Employee['status']) => {
  return { active: 'green', probation: 'orange', leave: 'gray', resigned: 'red' }[s]
}

/* ========== 添加员工抽屉 ========== */
const addDrawerVisible = ref(false)

const degreeOptions = [
  '初中',
  '高中',
  '中专',
  '中技',
  '大专',
  '本科',
  '硕士研究生',
  '博士研究生',
]

const defaultAddForm = () => ({
  // 顶部
  department: undefined as string | undefined,
  position: '',
  workLocation: '',
  contractType: undefined as string | undefined,
  // 基本信息
  name: '',
  gender: undefined as '男' | '女' | undefined,
  ethnicity: '',
  degree: undefined as string | undefined,
  birthDate: '',
  phone: '',
  maritalStatus: undefined as '未婚' | '已婚' | '离异' | '丧偶' | undefined,
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  hukouAddress: '',
  idCard: '',
  email: '',
  photo: '',
  // 表格
  educationHistory: [
    { period: [] as string[], degree: '', school: '', major: '' },
  ],
  family: [
    { relation: '', name: '', company: '', phone: '' },
  ],
  workHistory: [
    { period: [] as string[], company: '', title: '', reference: '', referencePhone: '', reason: '' },
  ],
  // 劳动关系
  contractReleased: undefined as boolean | undefined,
})

const addForm = reactive(defaultAddForm())
const editingId = ref<number | null>(null)

const isEditMode = computed(() => editingId.value !== null)
const drawerTitle = computed(() => (isEditMode.value ? '编辑员工档案' : '添加员工档案'))
const drawerOkText = computed(() => (isEditMode.value ? '保存' : '提交'))

const openAddDrawer = () => {
  // 重置表单
  Object.assign(addForm, defaultAddForm())
  editingId.value = null
  addDrawerVisible.value = true
}

/** 打开编辑抽屉，把员工数据回显到表单 */
const openEditDrawer = (record: Employee) => {
  // 1. 重置嵌套数组（避免深拷贝污染 default）
  Object.assign(addForm, defaultAddForm())
  // 2. 把员工字段映射到表单字段
  addForm.department = record.department as any
  addForm.position = record.position
  addForm.workLocation = record.workLocation
  addForm.contractType = record.contractType as any
  addForm.name = record.name
  addForm.gender = record.gender
  addForm.ethnicity = record.ethnicity
  addForm.degree = record.highestEducation as any
  addForm.birthDate = record.birthDate
  addForm.phone = record.phone
  addForm.maritalStatus = record.maritalStatus as any
  addForm.address = record.address
  addForm.emergencyContact = record.emergencyContact
  addForm.emergencyPhone = record.emergencyPhone
  addForm.hukouAddress = record.hukouAddress
  addForm.idCard = record.idCard
  addForm.email = record.email
  // 3. 嵌套数组：深拷贝避免修改原数据
  addForm.educationHistory = record.educationHistory.map(e => ({
    period: [...e.period],
    degree: e.degree,
    school: e.school,
    major: e.major,
  }))
  addForm.family = record.family.map(f => ({ ...f }))
  addForm.workHistory = record.workHistory.map(w => ({
    period: [...w.period],
    company: w.company,
    title: w.title,
    reference: w.reference,
    referencePhone: w.referencePhone,
    reason: w.reason,
  }))
  addForm.contractReleased = record.contractReleased
  editingId.value = record.id
  addDrawerVisible.value = true
}

const handleAddCancel = () => {
  addDrawerVisible.value = false
  editingId.value = null
}

const handleAddSubmit = () => {
  // 简单必填校验
  if (!addForm.department) {
    Message.warning('请选择部门')
    return
  }
  if (!addForm.position) {
    Message.warning('请输入岗位')
    return
  }
  if (!addForm.name) {
    Message.warning('请输入姓名')
    return
  }
  if (!addForm.gender) {
    Message.warning('请选择性别')
    return
  }

  if (isEditMode.value && editingId.value !== null) {
    // 编辑模式：找到原员工，合并表单字段
    const target = employees.find(e => e.id === editingId.value)
    if (target) {
      target.department = addForm.department as string
      target.position = addForm.position
      target.workLocation = addForm.workLocation
      target.contractType = addForm.contractType as string
      target.name = addForm.name
      target.gender = addForm.gender
      target.ethnicity = addForm.ethnicity
      target.highestEducation = (addForm.degree as string) || target.highestEducation
      target.birthDate = addForm.birthDate
      target.phone = addForm.phone
      target.maritalStatus = addForm.maritalStatus as string
      target.address = addForm.address
      target.emergencyContact = addForm.emergencyContact
      target.emergencyPhone = addForm.emergencyPhone
      target.hukouAddress = addForm.hukouAddress
      target.idCard = addForm.idCard
      target.email = addForm.email
      target.educationHistory = addForm.educationHistory.map(e => ({
        period: [...e.period],
        degree: e.degree,
        school: e.school,
        major: e.major,
      }))
      target.family = addForm.family.map(f => ({ ...f }))
      target.workHistory = addForm.workHistory.map(w => ({
        period: [...w.period],
        company: w.company,
        title: w.title,
        reference: w.reference,
        referencePhone: w.referencePhone,
        reason: w.reason,
      }))
      target.contractReleased = addForm.contractReleased
    }
    Message.success(`已保存员工档案：${addForm.name}`)
  } else {
    // 添加模式：模拟创建新员工
    Message.success(`已成功提交员工档案：${addForm.name}`)
  }
  addDrawerVisible.value = false
  editingId.value = null
}

const handlePhotoChange = (fileItem: any) => {
  const file = fileItem?.file
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    addForm.photo = String(e.target?.result || '')
  }
  reader.readAsDataURL(file)
}

const addTableRow = (key: 'educationHistory' | 'family' | 'workHistory') => {
  if (key === 'educationHistory') {
    addForm.educationHistory.push({ period: [], degree: '', school: '', major: '' })
  } else if (key === 'family') {
    addForm.family.push({ relation: '', name: '', company: '', phone: '' })
  } else {
    addForm.workHistory.push({ period: [], company: '', title: '', reference: '', referencePhone: '', reason: '' })
  }
}

const removeTableRow = (key: 'educationHistory' | 'family' | 'workHistory', idx: number) => {
  if (key === 'educationHistory') {
    addForm.educationHistory.splice(idx, 1)
  } else if (key === 'family') {
    addForm.family.splice(idx, 1)
  } else {
    addForm.workHistory.splice(idx, 1)
  }
}
</script>

<style scoped lang="scss">
.employee-profile-page {
  padding: $spacing-5;
}

.stats-row {
  margin-bottom: $spacing-5;
}

.filter-card {
  margin-bottom: $spacing-5;
}

.quick-filter-row {
  display: flex;
  align-items: center;
  gap: 50px;
  flex-wrap: wrap;
}

.quick-filter-right {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  min-width: 0;
}

.quick-filter-tabs-right {
  min-width: 0;
  flex-shrink: 1;

  :deep(.arco-tabs-nav) {
    margin-bottom: 0;
  }
}

.quick-filter-tabs {
  :deep(.arco-tabs-nav) {
    margin-bottom: $spacing-3;
  }

  :deep(.arco-tabs-nav-type-line) {
    padding-left: 0;
  }

  :deep(.arco-tabs-tab) {
    font-size: 18px;
    padding: 0 $spacing-3;
    display: inline-flex;
    align-items: baseline;
    gap: $spacing-2;
  }

  .tab-title-text {
    font-weight: $font-weight-medium;
    line-height: 22px;
  }

  .tab-title-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 20px;
    padding: 0 7px;
    border-radius: $border-radius-full;
    background: var(--color-neutral-3);
    color: $color-neutral-8;
    font-size: $font-size-caption;
    font-weight: $font-weight-medium;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    transition: all $transition-fast;
    transform: translateY(-2px);
  }

  :deep(.arco-tabs-tab-active) .tab-title-count {
    background: $color-primary-1;
    color: $color-primary-6;
  }
}

.filter-actions {
  display: flex;
  gap: $spacing-3;
  justify-content: flex-end;
}

.list-card {
  height: 100%;
}

.table-name-cell {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;
}

.table-name {
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
}

.employee-avatar {
  background: $color-primary-1;
  flex-shrink: 0;
}

/* 表格「操作」列：3 个文字按钮强制单行 */
:deep(.arco-table-td) .row-actions,
.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  flex-wrap: nowrap;
}

/* 离职日期为空时的占位符样式 */
.cell-muted {
  color: var(--color-text-4);
}

/* 文字按钮紧凑：3 个刚好塞进 200px */
.row-actions :deep(.arco-btn) {
  padding-left: 4px;
  padding-right: 4px;
}

.list-card-title {
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;

  .selected-tip {
    color: $color-neutral-7;
    font-weight: $font-weight-medium;
    font-size: $font-size-caption;
    transition: color $transition-fast;

    &.is-active {
      color: $color-primary-6;
      font-weight: $font-weight-bold;
    }
  }

  .clear-selection {
    margin-left: 4px;
    font-size: $font-size-caption;
  }
}

/* ===== 删除确认弹窗（页面正中居中） ===== */
.delete-confirm-body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;

  .delete-confirm-icon {
    color: $color-error-6;
    font-size: 22px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .delete-confirm-text {
    color: $color-neutral-8;
    font-size: $font-size-body;
    line-height: 1.6;
  }
}

/* 列表内手机号 hover 揭示 */
.phone-revealable {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: background-color $transition-fast;

  &:hover {
    background: $color-primary-1;
  }

  .reveal-icon {
    color: $color-neutral-5;
    transition: color $transition-fast;
  }

  &:hover .reveal-icon {
    color: $color-primary-6;
  }

  .reveal-text {
    font-feature-settings: 'tnum'; // 等宽数字，避免脱敏/明文切换时宽度跳动
  }
}

/* ===== 添加员工表单 ===== */
.add-form {
  padding: 0 $spacing-2;
}

.form-row {
  margin-bottom: $spacing-2;
}

.form-row-top {
  margin-bottom: $spacing-4;

  :deep(.arco-input-wrapper),
  :deep(.arco-select-view-single) {
    background: var(--color-neutral-2) !important;
    transition: background $transition-base;
  }

  :deep(.arco-input-wrapper:hover),
  :deep(.arco-select-view-single:hover) {
    background: var(--color-neutral-3) !important;
  }

  :deep(.arco-input-wrapper.arco-focus),
  :deep(.arco-select-view-single.arco-focus) {
    background: var(--color-bg-1) !important;
  }
}

.form-section-title {
  display: block;
  margin: $spacing-5 0 $spacing-3;
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  line-height: 1.5;
}

.form-basic {
  display: flex;
  gap: $spacing-5;
  align-items: flex-start;
}

.form-basic-fields {
  flex: 1;
  min-width: 0;
}

.form-basic-photo {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: $spacing-2;
}

.photo-frame {
  width: 100px;
  height: 130px;
  border: 1px dashed var(--color-neutral-5);
  border-radius: $border-radius-md;
  background: var(--color-neutral-2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-placeholder {
    font-size: 48px;
    color: var(--color-neutral-5);
  }
}

.form-table {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.form-table-head,
.form-table-row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 1.4fr 1.2fr 40px;
  gap: $spacing-2;
  align-items: center;
  min-width: 0;

  > * {
    min-width: 0;
  }
}

.form-table-row-7 {
  grid-template-columns: 2fr 1.1fr 0.9fr 0.9fr 1fr 1.1fr 40px;
}

.form-table-head {
  font-size: $font-size-caption;
  color: $color-neutral-7;
  font-weight: $font-weight-medium;
  padding: 0 4px;
}

.form-table-op {
  text-align: center;
}

/* ===== 批量导出弹窗（顶：统一配置横排 / 底：已选员工 + 按员工微调） ===== */
.batch-export-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  min-height: 560px; /* 较旧版 460px 加 100px */
}

/* 三个板块的共同容器样式 */
.batch-export-block {
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
  padding: $spacing-3;
  background: var(--color-bg-1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* 顶部：统一配置（占整行） */
.batch-export-unified {
  width: 100%;

  .batch-export-block-body {
    max-height: none;
    padding-top: $spacing-1;
  }
}

/* 统一配置横排：13 项 flex-wrap */
.batch-export-horizontal :deep(.arco-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
}

.batch-export-horizontal :deep(.arco-checkbox) {
  margin-right: 0;
}

/* 底部行：左 已选员工 / 右 按员工微调 */
.batch-export-bottom-row {
  display: flex;
  gap: $spacing-4;
  flex: 1;
  min-height: 360px;
}

.batch-export-left {
  width: 280px;
  flex-shrink: 0;
  overflow: hidden;
}

.batch-export-right {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.batch-export-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-2;
  border-bottom: 1px dashed var(--color-neutral-3);
  margin-bottom: $spacing-2;
  gap: $spacing-2;
  flex-shrink: 0;

  .batch-export-block-title {
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $color-neutral-10;
    display: inline-flex;
    align-items: center;
    gap: $spacing-1;
    flex: 1;
    min-width: 0;
  }

  .batch-export-block-subtitle {
    font-size: $font-size-caption;
    color: $color-neutral-7;
    font-weight: $font-weight-regular;
  }

  .batch-export-block-tag {
    font-size: 10px;
    line-height: 1;
    padding: 2px 6px;
    border-radius: $border-radius-sm;
    background: $color-primary-1;
    color: $color-primary-6;
    font-weight: $font-weight-medium;

    &.is-default {
      background: var(--color-neutral-2);
      color: $color-neutral-7;
    }
  }

  .batch-export-count {
    font-size: $font-size-caption;
    color: $color-primary-6;
    font-weight: $font-weight-medium;
  }
}

.batch-export-toolbar {
  font-size: $font-size-caption;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.batch-export-block-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  :deep(.arco-checkbox) {
    display: flex;
    align-items: flex-start;
    padding: 4px 0;
  }
}

/* 左侧员工列表 */
.batch-export-employee-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  padding: 0 $spacing-1;
}

.batch-export-employee-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $border-radius-sm;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background $transition-fast, border-color $transition-fast;

  &:hover {
    background: var(--color-neutral-2);
  }

  &.is-active {
    background: $color-primary-1;
    border-color: $color-primary-3;

    .batch-export-employee-name {
      color: $color-primary-6;
    }
  }
}

.batch-export-employee-info {
  flex: 1;
  min-width: 0;
}

.batch-export-employee-name-row {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  line-height: 1.3;
}

.batch-export-employee-name {
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  line-height: 1.3;
}

.batch-export-employee-tag {
  font-size: 10px;
  line-height: 1;
  padding: 0 6px;
  height: 16px;
}

.batch-export-employee-meta {
  font-size: $font-size-caption;
  color: $color-neutral-7;
  line-height: 1.3;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-export-employee-categories {
  font-size: $font-size-caption;
  color: $color-primary-6;
  line-height: 1.3;
  margin-top: 2px;
}

.batch-export-remove-btn {
  color: var(--color-neutral-5);
  flex-shrink: 0;
  transition: color $transition-fast;

  &:hover,
  &:focus {
    color: $color-error-6;
    background: transparent;
  }
}
</style>