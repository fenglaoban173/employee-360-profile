<template>
  <div class="employee-detail-page" v-if="employee">
    <!-- ========== 顶部：面包屑 + 操作按钮 ========== -->
    <div class="detail-topbar">
      <a-breadcrumb class="detail-breadcrumb">
        <a-breadcrumb-item>员工360°档案</a-breadcrumb-item>
        <a-breadcrumb-item>员工详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="detail-actions">
        <a-button type="primary" :loading="exporting" @click="handleExportProfile">
          <template #icon><icon-download /></template>
          导出档案
        </a-button>
        <a-button @click="goBack">
          <template #icon><icon-arrow-left /></template>
          返回
        </a-button>
      </div>
    </div>

    <!-- ========== 基础信息卡片 ========== -->
    <a-card class="profile-card" :bordered="false">
      <div class="profile-header">
        <a-avatar :size="88" class="profile-avatar">
          <img :src="employee.avatar" :alt="employee.name" />
        </a-avatar>
        <div class="profile-info">
          <div class="profile-name-row">
            <span class="profile-name">{{ employee.name }}</span>
            <a-tag :color="statusColor(employee.status)" size="medium" class="profile-status">
              {{ statusText(employee.status) }}
            </a-tag>
          </div>
          <div class="profile-meta">
            <span class="meta-item">
              <icon-idcard /> 工号：{{ employee.employeeNo }}
            </span>
            <span class="meta-item">
              <icon-clock-circle /> 入职日期：{{ employee.entryDate }}
            </span>
          </div>
        </div>
      </div>

      <a-divider class="profile-divider" />

      <a-row :gutter="32" class="profile-info-row">
        <a-col :span="12">
          <a-row :gutter="[16, 14]">
            <a-col :span="12"><info-cell label="部门" :value="employee.department" /></a-col>
            <a-col :span="12"><info-cell label="岗位" :value="employee.position" /></a-col>
            <a-col :span="12"><info-cell label="直属领导" :value="employee.reportTo" /></a-col>
            <a-col :span="12"><info-cell label="工作地点" :value="employee.workLocation" /></a-col>
          </a-row>
        </a-col>
        <a-col :span="12">
          <a-row :gutter="[16, 14]">
            <a-col :span="12"><info-cell label="合同类型" :value="employee.contractType" /></a-col>
            <a-col :span="12"><info-cell label="合同到期" :value="employee.contractEnd" /></a-col>
            <a-col :span="12"><info-cell label="员工类别" :value="employee.employeeCategory" /></a-col>
            <a-col :span="12"><info-cell label="在职状态" :value="statusText(employee.status)" /></a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>

    <!-- ========== Tabs ========== -->
    <a-card class="tabs-card" :bordered="false">
      <a-tabs :default-active-key="'basic'" class="detail-tabs">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" title="基本信息">
          <div class="tab-pane-content">
            <a-row :gutter="16" align="stretch" class="info-sections-row">
              <a-col :span="12">
                <div class="section-card">
                  <div class="section-title">个人信息</div>
                  <a-row :gutter="[16, 14]">
                    <a-col :span="12"><info-cell label="姓名" :value="employee.name" /></a-col>
                    <a-col :span="12"><info-cell label="性别" :value="employee.gender" /></a-col>
                    <a-col :span="12"><info-cell label="民族" :value="employee.ethnicity" /></a-col>
                    <a-col :span="12"><info-cell label="出生日期" :value="employee.birthDate" /></a-col>
                    <a-col :span="12"><info-cell label="婚姻状况" :value="employee.maritalStatus" /></a-col>
                    <a-col :span="12">
                      <div
                        class="info-cell info-cell-revealable"
                        @mouseenter="isIdCardRevealed = true"
                        @mouseleave="isIdCardRevealed = false"
                      >
                        <div class="info-cell-label">身份证号</div>
                        <div class="info-cell-value">
                          <icon-eye class="reveal-icon" />
                          <span class="reveal-text">
                            {{ isIdCardRevealed ? employee.idCard : maskIdCard(employee.idCard) }}
                          </span>
                        </div>
                      </div>
                    </a-col>
                    <a-col :span="12">
                      <div
                        class="info-cell info-cell-revealable"
                        @mouseenter="isPhoneRevealed = true"
                        @mouseleave="isPhoneRevealed = false"
                      >
                        <div class="info-cell-label">联系电话</div>
                        <div class="info-cell-value">
                          <icon-eye class="reveal-icon" />
                          <span class="reveal-text">
                            {{ isPhoneRevealed ? employee.phone : maskPhone(employee.phone) }}
                          </span>
                        </div>
                      </div>
                    </a-col>
                    <a-col :span="12"><info-cell label="电子邮箱" :value="employee.email" /></a-col>
                    <a-col :span="12"><info-cell label="现在住址" :value="employee.address" /></a-col>
                    <a-col :span="12"><info-cell label="户藉地址" :value="employee.hukouAddress" /></a-col>
                    <a-col :span="12"><info-cell label="籍贯" :value="employee.nativePlace" /></a-col>
                    <a-col :span="12"><info-cell label="最高学历" :value="employee.highestEducation" /></a-col>
                    <a-col :span="12"><info-cell label="毕业院校" :value="employee.graduateSchool" /></a-col>
                    <a-col :span="12"><info-cell label="紧急情况联系人" :value="employee.emergencyContact" /></a-col>
                    <a-col :span="12">
                      <div
                        class="info-cell info-cell-revealable"
                        @mouseenter="isEmergencyPhoneRevealed = true"
                        @mouseleave="isEmergencyPhoneRevealed = false"
                      >
                        <div class="info-cell-label">紧急联系电话</div>
                        <div class="info-cell-value">
                          <icon-eye class="reveal-icon" />
                          <span class="reveal-text">
                            {{ isEmergencyPhoneRevealed ? employee.emergencyPhone : maskPhone(employee.emergencyPhone) }}
                          </span>
                        </div>
                      </div>
                    </a-col>
                    <a-col :span="12">
                      <info-cell
                        label="是否与原单位解除劳动合同"
                        :value="employee.contractReleased === undefined ? '—' : (employee.contractReleased ? '是' : '否')"
                      />
                    </a-col>
                  </a-row>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="section-card">
                  <div class="section-title">在职信息</div>
                  <a-row :gutter="[16, 14]">
                    <a-col :span="24"><info-cell label="员工编号" :value="employee.employeeNo" /></a-col>
                    <a-col :span="24"><info-cell label="在职状态" :value="statusText(employee.status)" /></a-col>
                    <a-col :span="24"><info-cell label="司龄" :value="companyTenure" /></a-col>
                    <a-col :span="24"><info-cell label="员工类别" :value="employee.employeeCategory" /></a-col>
                    <a-col :span="24"><info-cell label="合同类型" :value="employee.contractType" /></a-col>
                    <a-col :span="24"><info-cell label="入职日期" :value="employee.entryDate" /></a-col>
                    <a-col :span="24"><info-cell label="转正日期" :value="regularizationRecord?.date || '—'" /></a-col>
                    <a-col :span="24"><info-cell label="离职日期" :value="employee.departureDate || '—'" /></a-col>
                  </a-row>
                </div>
              </a-col>
            </a-row>

            <!-- 员工成长记录 -->
            <div class="growth-section">
              <div class="section-title">员工成长记录</div>
              <div class="growth-stepper">
                <div
                  v-for="(node, idx) in growthNodes"
                  :key="node.key"
                  class="growth-node"
                  :style="{ animationDelay: `${idx * 80}ms`, '--node-color': growthTheme(node.key) }"
                >
                  <div class="growth-dot-col">
                    <div class="growth-dot">
                      <img
                        :src="growthIconImg(node.key)"
                        class="growth-dot-img"
                        :alt="node.label"
                      />
                    </div>
                    <div v-if="idx !== growthNodes.length - 1" class="growth-line" />
                  </div>
                  <div class="growth-text">
                    <div class="growth-label">{{ node.label }}</div>
                  </div>
                  <div class="growth-card">
                    <div class="growth-card-badge">{{ String(idx + 1).padStart(2, '0') }}</div>
                    <div class="growth-card-bar" />
                    <div class="growth-card-title">
                      {{ node.label }}
                      <span v-if="node.latestDate" class="growth-card-status">已完成</span>
                      <span v-else class="growth-card-status gray">未发生</span>
                    </div>
                    <div class="growth-card-scroll">
                      <template v-if="node.events.length">
                        <div
                          v-for="(event, eIdx) in node.events"
                          :key="eIdx"
                          class="growth-event"
                        >
                          <div class="growth-event-date">{{ event.date }}</div>
                          <div class="growth-event-title">{{ event.title }}</div>
                          <div class="growth-event-desc">{{ event.description }}</div>
                        </div>
                      </template>
                      <div v-else class="growth-event-empty">—</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 家庭成员 -->
        <a-tab-pane key="family" title="家庭成员">
          <div class="tab-pane-content">
            <a-empty v-if="!employee.family.length" description="暂无家庭成员" />
            <a-table
              v-else
              :data="employee.family"
              :pagination="false"
              row-key="name"
            >
              <template #columns>
                <a-table-column title="成员关系" data-index="relation" />
                <a-table-column title="姓名" data-index="name" />
                <a-table-column title="工作单位" data-index="company" />
                <a-table-column title="电话" data-index="phone">
                  <template #cell="{ record, rowIndex }">
                    <span
                      class="info-cell-revealable phone-revealable"
                      @mouseenter="revealedFamilyPhoneIndex = rowIndex"
                      @mouseleave="revealedFamilyPhoneIndex = null"
                    >
                      <icon-eye class="reveal-icon" />
                      <span class="reveal-text">
                        {{ revealedFamilyPhoneIndex === rowIndex ? record.phone : maskPhone(record.phone) }}
                      </span>
                    </span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 工作经历 -->
        <a-tab-pane key="work" title="工作经历">
          <div class="tab-pane-content">
            <a-empty v-if="!employee.workHistory.length" description="暂无工作经历" />
            <a-table
              v-else
              :data="employee.workHistory"
              :pagination="false"
              row-key="company"
            >
              <template #columns>
                <a-table-column title="起止日期" data-index="period">
                  <template #cell="{ record }">
                    {{ formatPeriod(record.period) }}
                  </template>
                </a-table-column>
                <a-table-column title="工作单位" data-index="company" />
                <a-table-column title="职务" data-index="title" />
                <a-table-column title="证明人" data-index="reference" />
                <a-table-column title="证明人电话" data-index="referencePhone">
                  <template #cell="{ record, rowIndex }">
                    <span
                      class="info-cell-revealable phone-revealable"
                      @mouseenter="revealedReferencePhoneIndex = rowIndex"
                      @mouseleave="revealedReferencePhoneIndex = null"
                    >
                      <icon-eye class="reveal-icon" />
                      <span class="reveal-text">
                        {{ revealedReferencePhoneIndex === rowIndex ? record.referencePhone : maskPhone(record.referencePhone) }}
                      </span>
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="离职原因" data-index="reason" />
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 教育经历 -->
        <a-tab-pane key="education" title="教育经历">
          <div class="tab-pane-content">
            <a-empty v-if="!employee.educationHistory.length" description="暂无教育经历" />
            <a-table
              v-else
              :data="employee.educationHistory"
              :pagination="false"
              row-key="school"
            >
              <template #columns>
                <a-table-column title="起止日期" data-index="period">
                  <template #cell="{ record }">
                    {{ formatPeriod(record.period) }}
                  </template>
                </a-table-column>
                <a-table-column title="学历/学位" data-index="degree" />
                <a-table-column title="毕业学校" data-index="school" />
                <a-table-column title="专业" data-index="major" />
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 合同信息 -->
        <a-tab-pane key="contract" title="合同信息">
          <div class="tab-pane-content">
            <div class="tab-toolbar">
              <a-button type="primary" @click="openAddContract">
                <template #icon><icon-plus /></template>
                添加合同
              </a-button>
            </div>
            <a-empty v-if="!employee.contracts.length" description="暂无合同记录" />
            <a-table
              v-else
              :data="employee.contracts"
              :pagination="false"
              row-key="name"
            >
              <template #columns>
                <a-table-column title="合同名称" data-index="name" />
                <a-table-column title="合同类型" data-index="type" />
                <a-table-column title="开始日期" data-index="startDate" />
                <a-table-column title="结束日期" data-index="endDate" />
                <a-table-column title="岗位" data-index="position" />
                <a-table-column title="合同附件">
                  <template #cell="{ record }">
                    <template v-if="record.attachments?.length">
                      <a-tag
                        v-for="name in record.attachments"
                        :key="name"
                        size="small"
                        color="arcoblue"
                        class="contract-attachment-tag"
                        style="margin-right: 4px; margin-bottom: 4px;"
                        @click="downloadAttachment(name)"
                      >
                        <template #icon><icon-file /></template>
                        {{ name }}
                      </a-tag>
                    </template>
                    <span v-else class="muted-text">—</span>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="160">
                  <template #cell="{ record, rowIndex }">
                    <span class="row-actions">
                      <a-button type="text" size="small" @click="openEditContract(record, rowIndex)">
                        <template #icon><icon-edit /></template>
                        编辑
                      </a-button>
                      <a-button
                        type="text"
                        status="danger"
                        size="small"
                        @click="requestDeleteConfirm('删除合同', '确定要删除这条合同记录吗？', () => deleteContract(rowIndex))"
                      >
                        <template #icon><icon-delete /></template>
                        删除
                      </a-button>
                    </span>
                  </template>
                </a-table-column>
              </template>
            </a-table>

            <!-- 合同新增/编辑抽屉 -->
            <a-drawer
              v-model:visible="contractModalVisible"
              :title="contractModalTitle"
              placement="right"
              :width="720"
              :ok-text="'保存'"
              :cancel-text="'取消'"
              :mask-closable="false"
              @ok="handleSaveContract"
              @cancel="handleCancelContract"
            >
              <a-form :model="contractForm" layout="vertical">
                <a-form-item label="合同名称" required>
                  <a-input v-model="contractForm.name" placeholder="如：劳动合同（3 年）" allow-clear />
                </a-form-item>
                <a-form-item label="合同类型" required>
                  <a-select v-model="contractForm.type" placeholder="请选择合同类型" allow-clear>
                    <a-option v-for="t in contractTypeOptions" :key="t" :value="t">{{ t }}</a-option>
                  </a-select>
                </a-form-item>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="开始日期" required>
                      <a-date-picker v-model="contractForm.startDate" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="结束日期" required>
                      <a-date-picker v-model="contractForm.endDate" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="岗位" required>
                  <a-input v-model="contractForm.position" placeholder="请输入岗位" allow-clear />
                </a-form-item>
                <a-form-item label="合同附件">
                  <a-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="application/pdf,image/*"
                    @change="handleContractFileUpload"
                    @before-upload="handleBeforeUpload"
                  >
                    <a-button>
                      <template #icon><icon-upload /></template>
                      上传合同附件
                    </a-button>
                  </a-upload>
                  <div v-if="contractForm.attachments.length" class="contract-attachments">
                    <a-tag
                      v-for="name in contractForm.attachments"
                      :key="name"
                      closable
                      color="arcoblue"
                      class="contract-attachment-tag"
                      style="margin-right: 6px; margin-bottom: 6px;"
                      @click="downloadAttachment(name)"
                      @close="removeContractAttachment(name)"
                    >
                      <template #icon><icon-file /></template>
                      {{ name }}
                    </a-tag>
                  </div>
                  <div v-else class="muted-text" style="margin-top: 8px;">尚未上传合同附件</div>
                </a-form-item>
              </a-form>
            </a-drawer>
          </div>
        </a-tab-pane>

        <!-- 转正记录 -->
        <a-tab-pane key="regularization" title="转正记录">
          <div class="tab-pane-content">
            <!-- 已有转正记录：垂直审批流样式 -->
            <div v-if="regularizationRecord" class="regularization-card">
              <div class="regularization-head">
                <div class="regularization-meta">
                  <div class="meta-row">
                    <span class="meta-label">转正日期</span>
                    <span class="meta-value">{{ regularizationRecord.date }}</span>
                  </div>
                  <div v-if="regularizationRecord.description" class="meta-row">
                    <span class="meta-label">备注</span>
                    <span class="meta-value">{{ regularizationRecord.description }}</span>
                  </div>
                </div>
                <span class="row-actions">
                  <a-button type="text" size="small" @click="openEditRegularization">
                    <template #icon><icon-edit /></template>
                    编辑
                  </a-button>
                  <a-button
                    type="text"
                    status="danger"
                    size="small"
                    @click="requestDeleteConfirm('删除转正记录', '确定要删除这条转正记录吗？', () => deleteRegularization())"
                  >
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </span>
              </div>

              <!-- 垂直审批流 -->
              <div class="approval-flow">
                <!-- Step 1: 转正申请 -->
                <div class="approval-step">
                  <div class="approval-dot" />
                  <div class="approval-content">
                    <div class="approval-title">转正申请</div>
                    <div class="approval-desc">
                      <div><span class="approval-key">转正日期：</span>{{ regularizationRecord.date }}</div>
                      <div v-if="regularizationRecord.description">
                        <span class="approval-key">备注：</span>{{ regularizationRecord.description }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: 转正汇报文档 -->
                <div class="approval-step">
                  <div class="approval-dot" />
                  <div class="approval-content">
                    <div class="approval-title">转正汇报文档</div>
                    <a-tag
                      v-if="regularizationRecord.report"
                      color="arcoblue"
                      class="contract-attachment-tag"
                      @click="downloadAttachment(regularizationRecord.report)"
                    >
                      <template #icon><icon-file /></template>
                      {{ regularizationRecord.report }}
                    </a-tag>
                    <span v-else class="muted-text">尚未上传</span>
                  </div>
                </div>

                <!-- Step 3: 考核人员评分 -->
                <div class="approval-step approval-step-last">
                  <div class="approval-dot" />
                  <div class="approval-content">
                    <div class="approval-title">
                      考核人员评分（{{ regularizationRecord.reviewers.length }} 人）
                    </div>
                    <a-empty
                      v-if="!regularizationRecord.reviewers.length"
                      description="暂无考核人员"
                    />
                    <div v-else class="approval-reviewers">
                      <div
                        v-for="(reviewer, idx) in regularizationRecord.reviewers"
                        :key="idx"
                        class="approval-reviewer"
                      >
                        <a-avatar :size="32" class="reviewer-avatar">
                          <img :src="avatarFor(reviewer.name)" :alt="reviewer.name" />
                        </a-avatar>
                        <span class="reviewer-name">{{ reviewer.name }}</span>
                        <a-tag
                          v-if="reviewer.attachment"
                          color="arcoblue"
                          size="small"
                          class="contract-attachment-tag reviewer-attachment"
                          @click="downloadAttachment(reviewer.attachment)"
                        >
                          <template #icon><icon-file /></template>
                          {{ reviewer.attachment }}
                        </a-tag>
                        <span v-else class="muted-text reviewer-attachment">未上传评分表</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 没有转正记录：空状态 + 添加按钮 -->
            <div v-else class="regularization-empty">
              <a-empty description="暂无转正记录" />
              <a-button type="primary" @click="openAddRegularization">
                <template #icon><icon-plus /></template>
                添加转正记录
              </a-button>
            </div>

            <!-- 转正记录编辑抽屉 -->
            <a-drawer
              v-model:visible="regularizationDrawerVisible"
              :title="regularizationDrawerTitle"
              placement="right"
              :width="780"
              :ok-text="'保存'"
              :cancel-text="'取消'"
              :mask-closable="false"
              @ok="handleSaveRegularization"
              @cancel="handleCancelRegularization"
            >
              <a-form :model="regularizationForm" layout="vertical">
                <a-form-item label="转正日期" required>
                  <a-date-picker v-model="regularizationForm.date" style="width: 100%" />
                </a-form-item>
                <a-form-item label="备注">
                  <a-input
                    v-model="regularizationForm.description"
                    placeholder="如：试用期满考核转正通过"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item label="转正汇报文档">
                  <a-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="application/pdf,image/*"
                    @change="handleRegularizationFileUpload"
                    @before-upload="handleBeforeUpload"
                  >
                    <a-button>
                      <template #icon><icon-upload /></template>
                      上传汇报文档
                    </a-button>
                  </a-upload>
                  <div v-if="regularizationForm.report" class="report-upload-preview">
                    <a-tag
                      color="arcoblue"
                      class="contract-attachment-tag"
                      closable
                      @click="downloadAttachment(regularizationForm.report)"
                      @close="regularizationForm.report = ''"
                    >
                      <template #icon><icon-file /></template>
                      {{ regularizationForm.report }}
                    </a-tag>
                  </div>
                  <div v-else class="muted-text" style="margin-top: 8px;">尚未上传</div>
                </a-form-item>

                <!-- 抽屉内考核人员管理（添加转正记录时即可一并录入多个） -->
                <a-form-item label="考核人员">
                  <div class="reviewer-section">
                    <a-button
                      type="primary"
                      size="small"
                      class="reviewer-add-btn"
                      @click="addNewReviewerRow"
                    >
                      <template #icon><icon-plus /></template>
                      添加考核人员
                    </a-button>
                    <div
                      v-for="(reviewer, idx) in regularizationForm.reviewers"
                      :key="idx"
                      class="reviewer-row"
                    >
                      <div class="reviewer-field">
                        <span class="reviewer-field-label">姓名</span>
                        <div class="reviewer-name-wrap">
                          <a-select
                            v-model="regularizationForm.reviewers[idx].name"
                            placeholder="请选择或输入姓名"
                            allow-clear
                            allow-search
                            filterable
                          >
                            <a-option
                              v-for="opt in reviewerNameOptions"
                              :key="opt"
                              :value="opt"
                            >
                              {{ opt }}
                            </a-option>
                          </a-select>
                        </div>
                      </div>
                      <div class="reviewer-field reviewer-field-attachment">
                        <span class="reviewer-field-label">评分表附件</span>
                        <a-upload
                          :auto-upload="false"
                          :show-file-list="false"
                          accept="application/pdf,image/*"
                          @change="(fileItem) => handleRowReviewerFileChange(fileItem, idx)"
                          @before-upload="handleBeforeUpload"
                        >
                          <a-button size="small">
                            <template #icon><icon-upload /></template>
                            {{ reviewer.attachment ? '更换' : '上传' }}
                          </a-button>
                        </a-upload>
                        <a-tag
                          v-if="reviewer.attachment"
                          size="small"
                          color="arcoblue"
                          class="contract-attachment-tag reviewer-file-tag"
                          closable
                          @click="downloadAttachment(reviewer.attachment)"
                          @close="reviewer.attachment = ''"
                        >
                          <template #icon><icon-file /></template>
                          {{ reviewer.attachment }}
                        </a-tag>
                      </div>
                      <a-button
                        type="text"
                        status="danger"
                        size="small"
                        class="reviewer-delete-btn"
                        @click="requestDeleteConfirm('删除考核人员', `确定删除「${reviewer.name || ''}」吗？`, () => removeFormReviewer(idx))"
                      >
                        删除
                      </a-button>
                    </div>
                  </div>
                </a-form-item>
              </a-form>
            </a-drawer>
          </div>
        </a-tab-pane>

        <!-- 培训记录 -->
        <a-tab-pane key="training" title="培训记录">
          <div class="tab-pane-content">
            <div class="tab-toolbar">
              <a-button type="primary" @click="openAddTraining">
                <template #icon><icon-plus /></template>
                添加培训
              </a-button>
            </div>
            <a-empty v-if="!employee.trainings.length" description="暂无培训记录" />
            <a-table
              v-else
              :data="employee.trainings"
              :pagination="false"
              row-key="name"
            >
              <template #columns>
                <a-table-column title="培训名称" data-index="name" />
                <a-table-column title="培训日期" data-index="date" :width="140" />
                <a-table-column title="培训类型" data-index="type" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="record.type === '内部' ? 'arcoblue' : 'purple'" size="small">
                      {{ record.type }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="培训时长" data-index="duration" :width="110">
                  <template #cell="{ record }">
                    <span v-if="record.duration">{{ record.duration }} 小时</span>
                    <span v-else class="muted-text">—</span>
                  </template>
                </a-table-column>
                <a-table-column title="培训地点" data-index="location">
                  <template #cell="{ record }">
                    <span v-if="record.location">{{ record.location }}</span>
                    <span v-else class="muted-text">—</span>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="160">
                  <template #cell="{ record, rowIndex }">
                    <span class="row-actions">
                      <a-button type="text" size="small" @click="openEditTraining(record, rowIndex)">
                        <template #icon><icon-edit /></template>
                        编辑
                      </a-button>
                      <a-button
                        type="text"
                        status="danger"
                        size="small"
                        @click="requestDeleteConfirm('删除培训记录', `确定删除「${record.name}」吗？`, () => deleteTraining(rowIndex))"
                      >
                        <template #icon><icon-delete /></template>
                        删除
                      </a-button>
                    </span>
                  </template>
                </a-table-column>
              </template>
            </a-table>

            <!-- 培训记录新增/编辑抽屉 -->
            <a-drawer
              v-model:visible="trainingModalVisible"
              :title="trainingModalTitle"
              placement="right"
              :width="520"
              :ok-text="'保存'"
              :cancel-text="'取消'"
              :mask-closable="false"
              @ok="handleSaveTraining"
              @cancel="handleCancelTraining"
            >
              <a-form :model="trainingForm" layout="vertical">
                <a-form-item label="培训名称" required>
                  <a-input v-model="trainingForm.name" placeholder="如：《产品方法论》" allow-clear />
                </a-form-item>
                <a-form-item label="培训日期" required>
                  <a-date-picker v-model="trainingForm.date" style="width: 100%" />
                </a-form-item>
                <a-form-item label="培训类型" required>
                  <a-radio-group v-model="trainingForm.type">
                    <a-radio value="内部">内部</a-radio>
                    <a-radio value="外部">外部</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="培训时长" required>
                  <a-input-number
                    v-model="trainingForm.duration"
                    :min="0"
                    :max="1000"
                    :step="1"
                    :precision="0"
                    placeholder="请输入"
                    allow-clear
                    style="width: 100%"
                  >
                    <template #append>小时</template>
                  </a-input-number>
                </a-form-item>
                <a-form-item label="培训地点">
                  <a-input v-model="trainingForm.location" placeholder="如：公司总部·3 楼培训室 / 线上（腾讯会议）" allow-clear />
                </a-form-item>
              </a-form>
            </a-drawer>
          </div>
        </a-tab-pane>

        <!-- 附件资料 -->
        <a-tab-pane key="attachment" title="附件资料">
          <div class="tab-pane-content">
            <div class="tab-toolbar">
              <a-button type="primary" @click="openAddAttachment">
                <template #icon><icon-plus /></template>
                添加附件
              </a-button>
            </div>
            <a-empty v-if="!employee.attachments.length" description="暂无附件资料" />
            <a-table
              v-else
              :data="employee.attachments"
              :pagination="false"
              row-key="name"
            >
              <template #columns>
                <a-table-column title="文件名" data-index="name">
                  <template #cell="{ record }">
                    <a-link @click="downloadAttachment(record.name)">
                      <template #icon><icon-file /></template>
                      {{ record.name }}
                    </a-link>
                  </template>
                </a-table-column>
                <a-table-column title="文件类型" data-index="category" :width="130">
                  <template #cell="{ record }">
                    <a-tag v-if="record.category" color="arcoblue" size="small">
                      {{ record.category }}
                    </a-tag>
                    <span v-else class="muted-text">—</span>
                  </template>
                </a-table-column>
                <a-table-column title="文件格式" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="fileFormatColor(record.name)" size="small">
                      {{ fileFormatOf(record.name) }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="上传人" data-index="uploader" :width="120" />
                <a-table-column title="上传时间" data-index="uploadDate" :width="140" />
                <a-table-column title="操作" :width="160">
                  <template #cell="{ record, rowIndex }">
                    <span class="row-actions">
                      <a-button type="text" size="small" @click="openEditAttachment(record, rowIndex)">
                        <template #icon><icon-edit /></template>
                        编辑
                      </a-button>
                      <a-button
                        type="text"
                        status="danger"
                        size="small"
                        @click="requestDeleteConfirm('删除附件', `确定删除「${record.name}」吗？`, () => deleteAttachment(rowIndex))"
                      >
                        <template #icon><icon-delete /></template>
                        删除
                      </a-button>
                    </span>
                  </template>
                </a-table-column>
              </template>
            </a-table>

            <!-- 附件新增/编辑抽屉 -->
            <a-drawer
              v-model:visible="attachmentModalVisible"
              :title="attachmentModalTitle"
              placement="right"
              :width="560"
              :ok-text="isEditAttachmentMode ? '保存' : '添加'"
              :cancel-text="'取消'"
              :mask-closable="false"
              @ok="handleSaveAttachment"
              @cancel="handleCancelAttachment"
            >
              <!-- 新增模式：拖拽 / 选择上传多个文件 -->
              <div v-if="!isEditAttachmentMode">
                <div
                  class="upload-dropzone"
                  :class="{ 'is-dragover': isAttachmentDragover }"
                  @dragenter.prevent.stop="onAttachmentDragEnter"
                  @dragover.prevent.stop="onAttachmentDragOver"
                  @dragleave.prevent.stop="onAttachmentDragLeave"
                  @drop.prevent.stop="onAttachmentDrop"
                  @click="triggerAttachmentFileInput"
                >
                  <icon-upload :size="32" />
                  <div class="upload-tip">将文件拖到此处，或 <a>点击选择</a></div>
                  <div class="upload-hint">支持多文件上传，单个文件 ≤ 10 MB</div>
                  <input
                    ref="attachmentFileInputRef"
                    type="file"
                    multiple
                    style="display: none"
                    @change="onAttachmentFileInputChange"
                  />
                </div>

                <!-- 已选文件列表：每个文件右侧单独选择文件类型 -->
                <div v-if="pendingAttachments.length" class="pending-list">
                  <div class="pending-list-header">
                    <span>待添加文件（{{ pendingAttachments.length }}）</span>
                    <a-link @click="clearPendingAttachments">清空</a-link>
                  </div>
                  <div
                    v-for="(item, idx) in pendingAttachments"
                    :key="item.key"
                    class="pending-item"
                  >
                    <a-avatar :size="32" class="pending-avatar">
                      <template #default>
                        <icon-file />
                      </template>
                    </a-avatar>
                    <div class="pending-info">
                      <div class="pending-name">{{ item.name }}</div>
                      <div class="pending-meta">
                        <span>{{ item.size }}</span>
                      </div>
                    </div>
                    <a-select
                      v-model="item.category"
                      placeholder="请选择文件类型"
                      style="width: 140px; flex-shrink: 0;"
                    >
                      <a-option
                        v-for="c in attachmentCategoryOptions"
                        :key="c"
                        :value="c"
                      >
                        {{ c }}
                      </a-option>
                    </a-select>
                    <a-button
                      type="text"
                      status="danger"
                      size="mini"
                      @click="removePendingAttachment(idx)"
                    >
                      <template #icon><icon-delete /></template>
                      移除
                    </a-button>
                  </div>
                </div>
              </div>

              <!-- 编辑模式：当前文件回显 + 替换上传 -->
              <div v-else>
                <!-- 当前文件信息卡（只读） -->
                <div class="current-file-card">
                  <a-avatar :size="40" class="pending-avatar">
                    <template #default><icon-file /></template>
                  </a-avatar>
                  <div class="current-file-info">
                    <div class="current-file-name">
                      {{ attachmentForm.name || '（未命名）' }}
                    </div>
                    <div class="current-file-meta">
                      <a-tag
                        v-if="attachmentForm.name"
                        :color="fileFormatColor(attachmentForm.name)"
                        size="small"
                      >
                        {{ fileFormatOf(attachmentForm.name) }}
                      </a-tag>
                      <span v-if="attachmentForm.size" class="current-file-size">
                        {{ attachmentForm.size }}
                      </span>
                      <span v-else class="muted-text">大小未知</span>
                    </div>
                  </div>
                </div>

                <!-- 文件类型（单选） -->
                <a-form-item label="文件类型" required style="margin-top: 16px">
                  <a-select
                    v-model="attachmentForm.category"
                    placeholder="请选择文件类型"
                  >
                    <a-option
                      v-for="c in attachmentCategoryOptions"
                      :key="c"
                      :value="c"
                    >
                      {{ c }}
                    </a-option>
                  </a-select>
                </a-form-item>

                <!-- 替换为新文件 -->
                <div class="replace-section">
                  <div class="section-label">替换为新文件（可选）</div>
                  <div
                    class="upload-dropzone upload-dropzone-compact"
                    :class="{ 'is-dragover': isReplaceDragover }"
                    @dragenter.prevent.stop="onReplaceDragEnter"
                    @dragover.prevent.stop="onReplaceDragOver"
                    @dragleave.prevent.stop="onReplaceDragLeave"
                    @drop.prevent.stop="onReplaceDrop"
                    @click="triggerReplaceFileInput"
                  >
                    <icon-upload :size="24" />
                    <div class="upload-tip">将新文件拖到此处，或 <a>点击选择</a></div>
                    <div class="upload-hint">仅支持单文件替换，≤ 10 MB</div>
                    <input
                      ref="replaceFileInputRef"
                      type="file"
                      style="display: none"
                      @change="onReplaceFileInputChange"
                    />
                  </div>
                </div>
              </div>
            </a-drawer>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>

  <!-- 员工不存在 -->
  <a-result
    v-else
    status="404"
    title="员工不存在"
    subtitle="未找到对应员工信息"
  >
    <template #extra>
      <a-button type="primary" @click="goBack">返回列表</a-button>
    </template>
  </a-result>

  <!-- 通用删除确认弹窗（页面正中居中） -->
  <a-modal
    v-model:visible="deleteConfirmVisible"
    :title="deleteConfirmTitle"
    :ok-text="'确认'"
    :cancel-text="'取消'"
    :mask-closable="false"
    @ok="handleDeleteConfirmOk"
    @cancel="handleDeleteConfirmCancel"
  >
    <div style="margin: 0; color: var(--color-neutral-7);">{{ deleteConfirmContent }}</div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, h, defineComponent, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  employees as employeesSource,
  type Employee,
  type GrowthRecord,
  type Contract,
  type TrainingRecord,
  type Attachment,
  type AttachmentCategory,
  type RegularizationRecord,
  type RegularizationReviewer,
  contractTypeOptions,
  attachmentCategoryOptions,
} from './data'
import {
  IconDownload,
  IconArrowLeft,
  IconIdcard,
  IconClockCircle,
  IconFile,
  IconPlus,
  IconEdit,
  IconDelete,
  IconUpload,
  IconUserGroup,
  IconEye,
} from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import { maskIdCard, maskPhone } from '@/utils/format'
import { downloadEmployeeProfile } from '@/utils/profileExport'

const route = useRoute()
const router = useRouter()

/** 考核人员可选名单（mock） */
const reviewerNameOptions = [
  '张明远', '张建国', '陈秀英', '李思雨', '陈欣宜',
  '李宇轩', '陈思远', '王丽', '赵文博', '刘子涵',
  '黄子韬', '周子墨', '吴梓涵', '徐若曦', '孙佳宁',
]

/** 响应式员工列表：直接复用 data.ts 里的 reactive 数组（list 页面也是这个引用） */
const employees = employeesSource

/** 根据路由 id 获取员工 */
const employee = computed<Employee | undefined>(() => {
  const id = Number(route.params.id)
  return employees.find(e => e.id === id)
})

/** 司龄：根据入职日期计算到当前 */
const companyTenure = computed(() => {
  if (!employee.value) return '—'
  const entry = new Date(employee.value.entryDate)
  const now = employee.value.departureDate
    ? new Date(employee.value.departureDate)
    : new Date()
  const months =
    (now.getFullYear() - entry.getFullYear()) * 12 +
    (now.getMonth() - entry.getMonth())
  const years = Math.floor(months / 12)
  const m = months % 12
  if (years <= 0) return `${months} 个月`
  if (m <= 0) return `${years} 年`
  return `${years} 年 ${m} 个月`
})

const statusText = (s: Employee['status']) =>
  ({ active: '在职', probation: '试用期', leave: '休假', resigned: '离职' }[s])
const statusColor = (s: Employee['status']) =>
  ({ active: 'green', probation: 'orange', leave: 'gray', resigned: 'red' }[s])

/** 导出档案进行中状态 */
const exporting = ref(false)
const handleExportProfile = async () => {
  if (!employee.value || exporting.value) return
  exporting.value = true
  const loadingMsg = Message.loading({ content: '正在生成档案包...', duration: 0 })
  try {
    const { fileCount, zipName } = await downloadEmployeeProfile(employee.value)
    Message.success(`已导出 ${fileCount} 个文件：${zipName}`)
  } catch (err) {
    console.error(err)
    Message.error('导出失败，请重试')
  } finally {
    loadingMsg.close()
    exporting.value = false
  }
}

const formatPeriod = (period: string[]) =>
  Array.isArray(period) && period.length === 2 ? `${period[0]} ~ ${period[1]}` : '—'

/* ========== 合同 CRUD ========== */
const contractModalVisible = ref(false)
const editingContractIndex = ref<number | null>(null)

const defaultContractForm = (): Contract => ({
  name: '',
  type: '',
  startDate: '',
  endDate: '',
  position: '',
  attachments: [],
})

const contractForm = reactive<Contract>(defaultContractForm())

const isEditContractMode = computed(() => editingContractIndex.value !== null)
const contractModalTitle = computed(() =>
  isEditContractMode.value ? '编辑合同' : '添加合同'
)

const openAddContract = () => {
  Object.assign(contractForm, defaultContractForm())
  // 岗位默认填当前员工的岗位，方便用户
  contractForm.position = employee.value?.position || ''
  editingContractIndex.value = null
  contractModalVisible.value = true
}

const openEditContract = (record: Contract, index: number) => {
  contractForm.name = record.name
  contractForm.type = record.type
  contractForm.startDate = record.startDate
  contractForm.endDate = record.endDate
  contractForm.position = record.position
  // 拷贝附件名列表，避免直接引用源数据
  contractForm.attachments = [...(record.attachments || [])]
  editingContractIndex.value = index
  contractModalVisible.value = true
}

const deleteContract = (index: number) => {
  if (!employee.value) return
  employee.value.contracts.splice(index, 1)
  Message.success('合同已删除')
}

/** 把字节数格式化为可读的文件大小 */
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 阻止 a-upload 默认上传，改为本地处理 */
const handleBeforeUpload = (file: File) => {
  // 返回 false 阻止自动上传，由 handleContractFileUpload 处理
  if (file.size > 10 * 1024 * 1024) {
    Message.error('合同附件不能超过 10 MB')
    return false
  }
  return false
}

/** 用户选择文件后：把文件登记到员工附件里（category='合同'），并把 name 加入表单 */
const handleContractFileUpload = (fileItem: any) => {
  const file = fileItem?.file as File | undefined
  if (!file || !employee.value) return
  const name = file.name
  const size = formatFileSize(file.size)
  const uploadDate = new Date().toISOString().slice(0, 10)
  // 员工附件中若还没有同名记录，则补一条 category='劳动合同' 的记录
  if (!employee.value.attachments.find(a => a.name === name)) {
    employee.value.attachments.push({ name, category: '劳动合同', size, uploadDate, uploader: employee.value.name })
  }
  if (!contractForm.attachments.includes(name)) {
    contractForm.attachments.push(name)
  }
}

/** 在弹窗里移除某个合同附件（仅从当前合同的关联列表中摘除，不删员工附件原记录） */
const removeContractAttachment = (name: string) => {
  const idx = contractForm.attachments.indexOf(name)
  if (idx >= 0) contractForm.attachments.splice(idx, 1)
}

/**
 * 点击合同附件触发本地浏览器下载
 * demo 环境没有真实文件，用 Blob 生成示例内容；正式接入后改为请求后端返回文件流
 */
const downloadAttachment = (name: string) => {
  const content =
    `这是合同附件 ${name} 的示例内容。\n` +
    `员工：${employee.value?.name || '—'}（${employee.value?.employeeNo || '—'}）\n` +
    `下载时间：${new Date().toLocaleString('zh-CN')}\n`
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 释放对象 URL，避免内存泄漏
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const handleSaveContract = () => {
  if (!contractForm.name) { Message.warning('请输入合同名称'); return }
  if (!contractForm.type) { Message.warning('请选择合同类型'); return }
  if (!contractForm.startDate) { Message.warning('请选择开始日期'); return }
  if (!contractForm.endDate) { Message.warning('请选择结束日期'); return }
  if (!contractForm.position) { Message.warning('请输入岗位'); return }

  if (!employee.value) return
  const next: Contract = {
    name: contractForm.name,
    type: contractForm.type,
    startDate: contractForm.startDate,
    endDate: contractForm.endDate,
    position: contractForm.position,
    attachments: [...contractForm.attachments],
  }
  if (editingContractIndex.value !== null) {
    const target = employee.value.contracts[editingContractIndex.value]
    if (target) Object.assign(target, next)
    Message.success('合同已更新')
  } else {
    employee.value.contracts.push(next)
    Message.success('合同已添加')
  }
  contractModalVisible.value = false
  editingContractIndex.value = null
}

const handleCancelContract = () => {
  contractModalVisible.value = false
  editingContractIndex.value = null
}

/* ========== 培训记录 CRUD ========== */
const trainingModalVisible = ref(false)
const editingTrainingIndex = ref<number | null>(null)

const defaultTrainingForm = (): TrainingRecord => ({
  name: '',
  date: '',
  type: '内部',
  location: '',
  duration: 0,
})

const trainingForm = reactive<TrainingRecord>(defaultTrainingForm())
const isEditTrainingMode = computed(() => editingTrainingIndex.value !== null)
const trainingModalTitle = computed(() =>
  isEditTrainingMode.value ? '编辑培训记录' : '添加培训记录'
)

const openAddTraining = () => {
  Object.assign(trainingForm, defaultTrainingForm())
  editingTrainingIndex.value = null
  trainingModalVisible.value = true
}

const openEditTraining = (record: TrainingRecord, index: number) => {
  trainingForm.name = record.name
  trainingForm.date = record.date
  trainingForm.type = record.type
  trainingForm.location = record.location
  trainingForm.duration = record.duration
  editingTrainingIndex.value = index
  trainingModalVisible.value = true
}

const deleteTraining = (index: number) => {
  employee.value!.trainings.splice(index, 1)
  Message.success('培训记录已删除')
}

const handleSaveTraining = () => {
  if (!trainingForm.name) { Message.warning('请输入培训名称'); return }
  if (!trainingForm.date) { Message.warning('请选择培训日期'); return }
  if (!trainingForm.type) { Message.warning('请选择培训类型'); return }
  if (trainingForm.duration === null || trainingForm.duration === undefined || trainingForm.duration <= 0) {
    Message.warning('请输入培训时长（小时）'); return
  }

  const next: TrainingRecord = {
    name: trainingForm.name,
    date: trainingForm.date,
    type: trainingForm.type,
    location: trainingForm.location,
    duration: trainingForm.duration,
  }

  if (editingTrainingIndex.value !== null) {
    Object.assign(employee.value!.trainings[editingTrainingIndex.value], next)
    Message.success('培训记录已更新')
  } else {
    employee.value!.trainings.push(next)
    Message.success('培训记录已添加')
  }

  trainingModalVisible.value = false
  editingTrainingIndex.value = null
}

const handleCancelTraining = () => {
  trainingModalVisible.value = false
  editingTrainingIndex.value = null
}

/* ========== 附件资料 CRUD ========== */
const attachmentModalVisible = ref(false)
const editingAttachmentIndex = ref<number | null>(null)

/** 敏感字段 hover 显示明文（默认脱敏） */
const isIdCardRevealed = ref(false)
const isPhoneRevealed = ref(false)
const isEmergencyPhoneRevealed = ref(false)
/** 家庭成员 / 工作经历 表格行 hover 揭示：同一时刻只可能有一行处于揭示态，记录其行 index */
const revealedFamilyPhoneIndex = ref<number | null>(null)
const revealedReferencePhoneIndex = ref<number | null>(null)

/** 从文件名中解析扩展名作为文件格式展示 */
const fileFormatOf = (name: string) => {
  const dot = name.lastIndexOf('.')
  if (dot < 0 || dot === name.length - 1) return '—'
  return name.slice(dot + 1).toUpperCase()
}

/** 不同文件格式用不同颜色 tag 区分 */
const fileFormatColor = (name: string) => {
  const fmt = fileFormatOf(name).toLowerCase()
  if (['pdf'].includes(fmt)) return 'red'
  if (['doc', 'docx'].includes(fmt)) return 'blue'
  if (['xls', 'xlsx'].includes(fmt)) return 'green'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fmt)) return 'arcoblue'
  if (['zip', 'rar', '7z'].includes(fmt)) return 'purple'
  return 'gray'
}

/* —— 新增模式：多文件待提交列表 —— */
interface PendingAttachment {
  /** 用于 v-for key 的本地唯一 id */
  key: number
  name: string
  size: string
  /** 每个文件各自的类型（不同文件可不同） */
  category: AttachmentCategory
}
const pendingAttachments = ref<PendingAttachment[]>([])
const isAttachmentDragover = ref(false)
const attachmentFileInputRef = ref<HTMLInputElement | null>(null)
let pendingKeySeq = 0

/* —— 编辑模式：替换上传（单文件） —— */
const isReplaceDragover = ref(false)
const replaceFileInputRef = ref<HTMLInputElement | null>(null)

/**
 * 当前登录用户（本项目无登录态，默认以"当前查看的员工"作为系统用户）；
 * 新增 / 编辑附件时一律以此作为 uploader 写入。
 */
const currentUserName = computed(() => employee.value?.name || '系统')

/** 取今天日期字符串（YYYY-MM-DD），用于提交时写入 uploadDate */
const todayString = () => new Date().toISOString().slice(0, 10)

/** 校验 + 替换编辑中的文件（更新 form 的 name 和 size） */
const replaceAttachmentFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    Message.error(`文件「${file.name}」超过 10 MB，已跳过`)
    return
  }
  attachmentForm.name = file.name
  attachmentForm.size = formatFileSize(file.size)
  Message.success(`已替换为「${file.name}」`)
}

/* —— 编辑模式：单条附件表单 —— */
const defaultAttachmentForm = (): Attachment => ({
  name: '',
  category: '白底照片',
  size: '',
  uploadDate: new Date().toISOString().slice(0, 10),
  uploader: '',
})

const attachmentForm = reactive<Attachment>(defaultAttachmentForm())
const isEditAttachmentMode = computed(() => editingAttachmentIndex.value !== null)
const attachmentModalTitle = computed(() =>
  isEditAttachmentMode.value ? '编辑附件' : '添加附件'
)

const openAddAttachment = () => {
  // 初始化待上传文件列表
  pendingAttachments.value = []
  editingAttachmentIndex.value = null
  attachmentModalVisible.value = true
}

const openEditAttachment = (record: Attachment, index: number) => {
  attachmentForm.name = record.name
  attachmentForm.size = record.size
  attachmentForm.category = record.category
  // uploadDate / uploader 不再从记录回填，保存时统一覆盖为当前时间和当前登录用户
  editingAttachmentIndex.value = index
  attachmentModalVisible.value = true
}

const deleteAttachment = (index: number) => {
  employee.value!.attachments.splice(index, 1)
  Message.success('附件已删除')
}

/** 校验 + 加入待上传列表（拖拽 / 选择文件两条路径共用） */
const addAttachmentFiles = (fileList: FileList | File[]) => {
  const files = Array.from(fileList)
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      Message.error(`文件「${file.name}」超过 10 MB，已跳过`)
      continue
    }
    // 同名文件已在待上传列表则跳过（避免误重复添加）
    if (pendingAttachments.value.some(p => p.name === file.name)) {
      Message.warning(`文件「${file.name}」已在列表中`)
      continue
    }
    pendingAttachments.value.push({
      key: ++pendingKeySeq,
      name: file.name,
      size: formatFileSize(file.size),
      category: '' as AttachmentCategory, // 等待用户在右侧下拉中选择
    })
  }
}

const removePendingAttachment = (idx: number) => {
  pendingAttachments.value.splice(idx, 1)
}

const clearPendingAttachments = () => {
  pendingAttachments.value = []
}

/* —— 拖拽 / 选择文件 事件 —— */
const onAttachmentDragEnter = () => { isAttachmentDragover.value = true }
const onAttachmentDragOver = () => { isAttachmentDragover.value = true }
const onAttachmentDragLeave = (e: DragEvent) => {
  // 仅当真正离开 dropzone 时才取消高亮（避免子元素触发冒泡）
  if (e.currentTarget === e.target) isAttachmentDragover.value = false
}
const onAttachmentDrop = (e: DragEvent) => {
  isAttachmentDragover.value = false
  if (e.dataTransfer?.files?.length) {
    addAttachmentFiles(e.dataTransfer.files)
  }
}
const triggerAttachmentFileInput = () => {
  attachmentFileInputRef.value?.click()
}
const onAttachmentFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    addAttachmentFiles(target.files)
  }
  // 清空 input 以便重复选择同一文件
  target.value = ''
}

/* —— 拖拽 / 选择文件 事件（编辑模式：单文件替换） —— */
const onReplaceDragEnter = () => { isReplaceDragover.value = true }
const onReplaceDragOver = () => { isReplaceDragover.value = true }
const onReplaceDragLeave = (e: DragEvent) => {
  if (e.currentTarget === e.target) isReplaceDragover.value = false
}
const onReplaceDrop = (e: DragEvent) => {
  isReplaceDragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) replaceAttachmentFile(file)
}
const triggerReplaceFileInput = () => {
  replaceFileInputRef.value?.click()
}
const onReplaceFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) replaceAttachmentFile(file)
  target.value = ''
}

const handleSaveAttachment = () => {
  if (isEditAttachmentMode.value) {
    // 编辑单条：uploader / uploadDate 不暴露给用户，但 category 由用户在抽屉里选择
    if (!attachmentForm.name) { Message.warning('请先选择文件'); return }
    if (!attachmentForm.category) { Message.warning('请选择文件类型'); return }

    const target = employee.value!.attachments[editingAttachmentIndex.value!]
    if (target) {
      target.name = attachmentForm.name.trim()
      target.size = attachmentForm.size
      target.category = attachmentForm.category
      target.uploadDate = todayString()
      target.uploader = currentUserName.value
    }
    Message.success('附件已更新')
    attachmentModalVisible.value = false
    editingAttachmentIndex.value = null
    return
  }

  // 新增多条：每个文件各自有 category，逐个校验 + 写入
  if (!pendingAttachments.value.length) {
    Message.warning('请先选择或拖入文件')
    return
  }
  const missing = pendingAttachments.value.filter(p => !p.category)
  if (missing.length) {
    Message.warning(`请为「${missing[0].name}」选择文件类型`)
    return
  }

  const now = todayString()
  for (const p of pendingAttachments.value) {
    employee.value!.attachments.push({
      name: p.name,
      size: p.size,
      category: p.category,
      uploadDate: now,
      uploader: currentUserName.value,
    })
  }
  Message.success(`已添加 ${pendingAttachments.value.length} 个附件`)
  attachmentModalVisible.value = false
  editingAttachmentIndex.value = null
}

const handleCancelAttachment = () => {
  attachmentModalVisible.value = false
  editingAttachmentIndex.value = null
}

/** 成长记录 stepper 节点（展示 5 个固定节点，每个节点保留该类型下的全部事件） */
const growthNodes = computed(() => {
  if (!employee.value) return []
  const records = employee.value.growthRecords
  // 按类型顺序（已移除：绩效、晋升、调薪）
  const order: { key: GrowthRecord['type']; label: string }[] = [
    { key: 'entry', label: '入职' },
    { key: 'regularization', label: '转正' },
    { key: 'training', label: '培训' },
    { key: 'transfer', label: '调岗' },
    { key: 'resignation', label: '离职' },
  ]
  return order.map(n => {
    // 同一类型可能有多条记录（如多次培训 / 多次调岗），全部展开，日期倒序
    const events = records
      .filter(r => r.type === n.key)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(r => ({
        date: r.date,
        title: r.title,
        description: r.description,
      }))
    return {
      ...n,
      events,
      // 兼容老字段：第一个事件（最新）的 date/title/description，用于标题区的"已完成"判断
      latestDate: events[0]?.date || '',
    }
  })
})

const goBack = () => {
  router.push('/employee-profile')
}

/* ========== 通用删除确认（页面正中居中弹窗） ========== */
const deleteConfirmVisible = ref(false)
const deleteConfirmTitle = ref('确认删除')
const deleteConfirmContent = ref('')
let pendingDeleteAction: (() => void) | null = null

const requestDeleteConfirm = (
  title: string,
  content: string,
  action: () => void
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

/** 当前员工的转正记录（通常 0 或 1 条） */
const regularizationRecord = computed<RegularizationRecord | null>(() => {
  if (!employee.value) return null
  return employee.value.regularizations?.[0] || null
})

/** 考核人员头像（按姓名生成稳定的占位头像） */
const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

/* ========== 转正记录 编辑 ========== */
const regularizationDrawerVisible = ref(false)
const isEditRegularization = computed(() => !!regularizationRecord.value)
const regularizationDrawerTitle = computed(() =>
  isEditRegularization.value ? '编辑转正记录' : '添加转正记录'
)
const defaultRegularizationForm = () => ({
  date: '',
  report: '',
  description: '',
  reviewers: [] as RegularizationReviewer[],
})
const regularizationForm = reactive(defaultRegularizationForm())

const openAddRegularization = () => {
  Object.assign(regularizationForm, defaultRegularizationForm())
  regularizationDrawerVisible.value = true
}
const openEditRegularization = () => {
  if (!regularizationRecord.value) return
  regularizationForm.date = regularizationRecord.value.date
  regularizationForm.report = regularizationRecord.value.report || ''
  regularizationForm.description = regularizationRecord.value.description || ''
  // 把已有考核人员拷贝到表单里，编辑时增删都在这份本地副本上
  regularizationForm.reviewers = regularizationRecord.value.reviewers.map(r => ({
    name: r.name,
    attachment: r.attachment,
  }))
  regularizationDrawerVisible.value = true
}
const handleSaveRegularization = () => {
  if (!regularizationForm.date) { Message.warning('请选择转正日期'); return }
  if (!employee.value) return
  if (!employee.value.regularizations) employee.value.regularizations = []

  // 过滤掉空行（姓名未填的视为未填写，自动丢弃）
  const cleanedReviewers = regularizationForm.reviewers
    .filter(r => r.name && r.name.trim())
    .map(r => ({
      name: r.name.trim(),
      attachment: r.attachment || undefined,
    }))

  const payload: RegularizationRecord = {
    date: regularizationForm.date,
    report: regularizationForm.report || undefined,
    description: regularizationForm.description || undefined,
    reviewers: cleanedReviewers,
  }

  if (regularizationRecord.value) {
    Object.assign(regularizationRecord.value, payload)
    Message.success('转正记录已更新')
  } else {
    employee.value.regularizations.push(payload)
    Message.success('转正记录已添加')
  }
  regularizationDrawerVisible.value = false
}
const handleCancelRegularization = () => {
  regularizationDrawerVisible.value = false
}
const deleteRegularization = () => {
  if (!employee.value) return
  employee.value.regularizations = []
  Message.success('转正记录已删除')
}

/** 上传转正汇报文档：登记到员工附件中，并把文件名写到表单 */
const handleRegularizationFileUpload = (fileItem: any) => {
  const file = fileItem?.file as File | undefined
  if (!file || !employee.value) return
  const name = file.name
  const size = formatFileSize(file.size)
  const uploadDate = new Date().toISOString().slice(0, 10)
  if (!employee.value.attachments.find(a => a.name === name)) {
    employee.value.attachments.push({ name, category: '劳动合同', size, uploadDate, uploader: employee.value.name })
  }
  regularizationForm.report = name
}

/* ========== 抽屉内：考核人员 表格式行内增删 ========== */

/** 新增一空行：姓名输入框 + 上传按钮 + 删除 */
const addNewReviewerRow = () => {
  regularizationForm.reviewers.push({ name: '', attachment: '' })
}

const removeFormReviewer = (idx: number) => {
  regularizationForm.reviewers.splice(idx, 1)
}

/** 抽屉内：考核人员上传评分表（按行索引直接写入对应行） */
const handleRowReviewerFileChange = (fileItem: any, idx: number) => {
  const file = fileItem?.file as File | undefined
  if (!file || !employee.value) return
  const name = file.name
  const size = formatFileSize(file.size)
  const uploadDate = new Date().toISOString().slice(0, 10)
  if (!employee.value.attachments.find(a => a.name === name)) {
    employee.value.attachments.push({ name, category: '劳动合同', size, uploadDate, uploader: employee.value.name })
  }
  const target = regularizationForm.reviewers[idx]
  if (target) target.attachment = name
}

/** 成长记录 stepper 节点图标（用自定义图片） */
const growthIconImg = (key: GrowthRecord['type']) => {
  // public 目录下的图片，运行时直接走根路径
  const base = import.meta.env.BASE_URL || './'
  const map: Partial<Record<GrowthRecord['type'], string>> = {
    entry: `${base}growth/entry.png`,
    regularization: `${base}growth/regularization.png`,
    training: `${base}growth/training.png`,
    transfer: `${base}growth/transfer.png`,
    resignation: `${base}growth/resignation.svg`,
  }
  return map[key] || ''
}

/** 每个节点对应的主题色（与图标配色保持一致） */
const growthTheme = (key: GrowthRecord['type']) => {
  const map: Record<GrowthRecord['type'], string> = {
    entry: '#2b8af0',          // 蓝
    regularization: '#19be6b',  // 绿
    training: '#722ed1',        // 紫
    transfer: '#0fc6c2',        // 青
    promotion: '#722ed1',
    performance: '#2b8af0',
    salary: '#ffb800',
    resignation: '#f56565',    // 红
  }
  return map[key] || '#8c8c8c'
}

/** 通用 label/value 信息单元（行内展示用） */
const InfoCell = defineComponent({
  name: 'InfoCell',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: '—' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'info-cell' }, [
        h('div', { class: 'info-cell-label' }, props.label),
        h('div', { class: 'info-cell-value' }, String(props.value ?? '—')),
      ])
  },
})
</script>

<style scoped lang="scss">
.employee-detail-page {
  padding: $spacing-5;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

/* ===== 顶部 ===== */
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-1);
  padding: $spacing-3 $spacing-4;
  border-radius: $border-radius-md;
}

.detail-breadcrumb {
  font-size: $font-size-body;
}

.detail-actions {
  display: flex;
  gap: $spacing-3;
}

/* ===== 基础信息卡片 ===== */
.profile-card {
  :deep(.arco-card-body) {
    padding: $spacing-5;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: $spacing-5;
}

.profile-avatar {
  background: $color-primary-1;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-3;
}

.profile-name {
  font-size: 22px;
  font-weight: $font-weight-bold;
  color: $color-neutral-10;
}

.profile-status {
  font-weight: $font-weight-medium;
}

.profile-meta {
  display: flex;
  gap: $spacing-5;
  flex-wrap: wrap;
  color: $color-neutral-7;
  font-size: $font-size-body;

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    :deep(.arco-icon) {
      font-size: 14px;
      color: $color-neutral-6;
    }
  }
}

.profile-divider {
  margin: $spacing-4 0;
}

.profile-info-row {
  :deep(.arco-col) {
    display: flex;
  }
}

:deep(.info-cell) {
  display: flex;
  align-items: baseline;
  gap: $spacing-2;
  width: 100%;

  .info-cell-label {
    flex-shrink: 0;
    color: $color-neutral-7;
    font-size: $font-size-body;
    min-width: 70px;
  }

  .info-cell-value {
    color: $color-neutral-10;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
  }
}

/* 敏感字段（身份证号 / 手机号）：hover 切换明文 */
.info-cell-revealable {
  cursor: pointer;
  transition: background-color $transition-fast;
  border-radius: $border-radius-sm;
  padding: 2px 4px;
  margin: -2px -4px;

  &:hover {
    background: $color-primary-1;
  }

  .reveal-icon {
    color: $color-neutral-5;
    margin-right: 4px;
    transition: color $transition-fast;
  }

  &:hover .reveal-icon {
    color: $color-primary-6;
  }

  .reveal-text {
    font-feature-settings: 'tnum'; // 等宽数字，避免脱敏/明文切换时宽度跳动
  }
}

/* 表格内单元格用：去掉负 margin / 缩小 padding，避免破坏行高 */
.phone-revealable {
  display: inline-flex;
  align-items: center;
  padding: 1px 4px;
  margin: 0;

  .reveal-text {
    font-feature-settings: 'tnum';
  }
}

/* ===== Tabs 卡片 ===== */
.tabs-card {
  :deep(.arco-card-body) {
    padding: $spacing-3 $spacing-5 $spacing-5;
  }
}

.detail-tabs {
  :deep(.arco-tabs-content) {
    padding-top: $spacing-4;
  }
}

.tab-pane-content {
  padding: $spacing-2 0;
}

.tab-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: $spacing-3;
}

.muted-text {
  color: $color-neutral-5;
}

.contract-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-top: $spacing-2;
}

/* ===== 附件资料：拖拽上传 + 待上传列表 ===== */
.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-6 $spacing-4;
  border: 1px dashed var(--color-neutral-4);
  border-radius: $border-radius-md;
  background: var(--color-neutral-1);
  color: $color-neutral-7;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover,
  &.is-dragover {
    border-color: $color-primary-6;
    background: $color-primary-1;
    color: $color-primary-6;
  }

  .upload-tip {
    font-size: $font-size-body;
    color: $color-neutral-8;

    a {
      color: $color-primary-6;
      font-weight: $font-weight-medium;
    }
  }

  .upload-hint {
    font-size: $font-size-caption;
    color: $color-neutral-5;
  }
}

/* 编辑模式下的紧凑版（用于"替换为新文件"） */
.upload-dropzone-compact {
  padding: $spacing-4 $spacing-3;
  gap: $spacing-1;
}

/* 编辑模式：当前文件回显卡 */
.current-file-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  background: var(--color-neutral-2);
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
}

.current-file-info {
  flex: 1;
  min-width: 0;
}

.current-file-name {
  font-size: $font-size-body;
  color: $color-neutral-10;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-file-meta {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-top: 2px;
  font-size: $font-size-caption;
  color: $color-neutral-6;
}

.current-file-size {
  color: $color-neutral-6;
}

/* 编辑模式：替换区 */
.replace-section {
  margin-top: $spacing-4;
}

.section-label {
  font-size: $font-size-body;
  color: $color-neutral-8;
  font-weight: $font-weight-medium;
  margin-bottom: $spacing-2;
}

.pending-list {
  margin-top: $spacing-3;
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
  background: var(--color-bg-1);
  overflow: hidden;
}

.pending-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 $spacing-3;
  background: var(--color-neutral-2);
  font-size: $font-size-body;
  color: $color-neutral-8;
  border-bottom: 1px solid var(--color-neutral-3);
}

.pending-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  border-bottom: 1px solid var(--color-neutral-3);
  transition: background-color $transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-neutral-2);
  }
}

.pending-avatar {
  flex-shrink: 0;
  background: $color-primary-1;
  color: $color-primary-6;
}

.pending-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* 待上传列表里的「文件类型」下拉：缩小字号 + 紧凑 padding，避免抢占文件名空间 */
.pending-item {
  :deep(.arco-select-view) {
    font-size: 9px;
    padding-left: 8px;
    padding-right: 8px;
  }
  :deep(.arco-select-view-placeholder) {
    font-size: 5px;
  }
  :deep(.arco-select-view-single) {
    min-height: 24px;
  }
}

.pending-name {
  font-size: $font-size-body;
  color: $color-neutral-10;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pending-meta {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-top: 2px;
  font-size: $font-size-caption;
  color: $color-neutral-6;
}

.pending-divider {
  color: var(--color-neutral-4);
}

/* ===== 转正记录 卡片 ===== */
.regularization-card {
  padding: $spacing-4 $spacing-5;
}

.regularization-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-3;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid var(--color-neutral-3);
  margin-bottom: $spacing-4;
}

.regularization-meta {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  flex: 1;
  min-width: 0;
}

.meta-row {
  display: flex;
  align-items: baseline;
  gap: $spacing-2;

  .meta-label {
    flex-shrink: 0;
    color: $color-neutral-7;
    min-width: 70px;
  }

  .meta-value {
    color: $color-neutral-10;
    font-weight: $font-weight-medium;
  }
}

.regularization-section {
  margin-top: $spacing-4;

  &:first-of-type {
    margin-top: 0;
  }
}

.section-title-sm {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-3;
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
}

.reviewer-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.reviewer-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  background: var(--color-bg-1);
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
}

.reviewer-avatar {
  background: $color-primary-1;
  flex-shrink: 0;
}

.reviewer-info {
  flex: 1;
  min-width: 0;
}

.reviewer-name {
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  margin-bottom: 4px;
}

.reviewer-attachment {
  font-size: $font-size-caption;
}

.regularization-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-5 0;
}

.report-upload-preview {
  margin-top: $spacing-2;
}

/* 转正记录抽屉内：考核人员 标准表单式行内管理 */
.reviewer-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.reviewer-add-btn {
  align-self: flex-start;
  margin-bottom: $spacing-3;
}

.reviewer-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  margin-bottom: $spacing-2;
  background: var(--color-bg-1);
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
  flex-wrap: nowrap;
}

.reviewer-field {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-shrink: 0;
}

.reviewer-field-label {
  color: var(--color-neutral-7);
  font-size: $font-size-body;
  white-space: nowrap;
}

.reviewer-name-wrap {
  width: 140px;
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
}

.reviewer-name-wrap :deep(.arco-select) {
  width: 100%;
}

.reviewer-name-wrap :deep(.arco-select-view),
.reviewer-name-wrap :deep(.arco-select-view-input) {
  min-width: 0;
  width: 100%;
}

.reviewer-field-attachment {
  flex: 1;
  min-width: 0;
  flex-shrink: 1;
  flex-wrap: nowrap;
}

.reviewer-file-tag {
  max-width: 220px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}

.reviewer-delete-btn {
  margin-left: auto;
  flex-shrink: 0;
}

/* ===== 转正记录：垂直审批流 ===== */
.approval-flow {
  position: relative;
  padding: $spacing-2 0 $spacing-2 8px;
}

.approval-step {
  position: relative;
  padding: 0 0 $spacing-5 28px;

  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 10px;
    bottom: 0;
    width: 2px;
    background: var(--color-neutral-3);
  }
}

.approval-step-last {
  padding-bottom: 0;

  &::before { display: none; }
}

.approval-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: $color-primary-6;
  border: 3px solid var(--color-bg-1);
  box-shadow: 0 0 0 1px $color-primary-6;
}

.approval-title {
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  margin-bottom: $spacing-2;
}

.approval-key {
  color: var(--color-neutral-7);
  margin-right: 4px;
}

.approval-desc {
  color: var(--color-neutral-8);
  font-size: $font-size-body;
  line-height: 1.8;
}

.approval-reviewers {
  display: flex;
  flex-direction: column;
}

.approval-reviewer {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 0;
  border-bottom: 1px solid var(--color-neutral-3);
  transition: background-color $transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-neutral-2);
  }
}

.reviewer-name {
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
}

.reviewer-attachment {
  flex-shrink: 0;
  margin-left: 20px;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 表格「操作」列：编辑/删除同行不换行 */
.row-actions {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  white-space: nowrap;
}

/* 合同附件 tag：可点击 + hover 反馈 */
:deep(.contract-attachment-tag) {
  cursor: pointer;
  transition: opacity $transition-fast;

  &:hover {
    opacity: 0.8;
  }
}

/* ===== 通用 section 卡片 ===== */
.section-card {
  background: var(--color-neutral-2);
  border-radius: $border-radius-md;
  padding: $spacing-4 $spacing-5;
  height: 100%;

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: $spacing-3;
    padding-bottom: $spacing-2;
    border-bottom: 1px solid var(--color-neutral-3);
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  }
}

/* ===== 成长记录 stepper ===== */
.growth-section {
  margin-top: $spacing-5;
  padding: $spacing-4 $spacing-5;
  background: var(--color-neutral-2);
  border-radius: $border-radius-md;

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: $spacing-3;
    padding-bottom: $spacing-2;
    border-bottom: 1px solid var(--color-neutral-3);
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  }
}

.growth-stepper {
  display: flex;
  align-items: flex-start;
  margin-top: $spacing-3;
  overflow-x: auto;
}

.growth-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  position: relative;
}

.growth-dot-col {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
}

.growth-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: $font-weight-bold;
  z-index: 1;
  background: transparent;
  color: $color-neutral-6;
  border: none;

  :deep(.arco-icon) {
    font-size: 16px;
  }
}

/* 使用自定义图片的节点：图片本身是彩色圆，不需要背景 */
.growth-dot-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
  z-index: 1;
}

.growth-line {
  position: absolute;
  top: 20px;
  left: calc(50% + 20px);
  right: calc(-50% + 20px);
  height: 2px;
  background: var(--color-neutral-4);
  transform: translateY(-50%);
}

.growth-text {
  margin-top: $spacing-2;
  text-align: center;
}

.growth-label {
  font-size: $font-size-body;
  color: $color-neutral-10;
  font-weight: $font-weight-medium;
}


.growth-card {
  position: relative;
  margin-top: $spacing-3;
  padding: $spacing-3 $spacing-4 $spacing-4;
  width: 100%;
  max-width: 220px;
  height: 220px; // 固定高度，确保多事件节点可滚动
  display: flex;
  flex-direction: column;
  background: white;
  background-image: linear-gradient(180deg, color-mix(in srgb, var(--node-color, $color-primary-6) 8%, white) 0%, white 60%);
  border: 1px solid var(--color-neutral-3);
  border-radius: $border-radius-md;
  text-align: left;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(12px);
  animation: growth-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--node-color, $color-primary-6) 35%, transparent),
                0 4px 8px -2px rgba(0, 0, 0, 0.06);
    border-color: var(--node-color, $color-primary-6);
  }
}

@keyframes growth-card-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.growth-card-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--node-color, $color-primary-6);
  border-radius: $border-radius-md $border-radius-md 0 0;
}

.growth-card-badge {
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--node-color, $color-primary-6) 12%, white);
  color: var(--node-color, $color-primary-6);
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.growth-card-title {
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
  color: $color-neutral-10;
  margin: $spacing-4 0 $spacing-2;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
  flex-shrink: 0; // 标题固定不被压缩
}

.growth-card-status {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-sm;
  background: color-mix(in srgb, var(--node-color, $color-primary-6) 12%, white);
  color: var(--node-color, $color-primary-6);

  &.gray {
    background: var(--color-neutral-3);
    color: $color-neutral-7;
  }
}

/* 卡片内事件列表：固定高度 + 垂直滚动 */
.growth-card-scroll {
  flex: 1;
  min-height: 0; // 让 flex 子项可以真正收缩到父容器以下，触发 overflow
  overflow-y: auto;
  padding-right: 4px;
  margin-right: -4px; // 滚动条不占内容空间

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-neutral-4);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.growth-event {
  padding: $spacing-2 0;
  border-bottom: 1px dashed var(--color-neutral-3);

  &:last-child {
    border-bottom: none;
  }
}

.growth-event-date {
  font-size: $font-size-caption;
  color: var(--node-color, $color-primary-6);
  font-weight: $font-weight-medium;
  font-variant-numeric: tabular-nums;
  margin-bottom: 2px;
}

.growth-event-title {
  font-size: $font-size-caption;
  color: $color-neutral-10;
  font-weight: $font-weight-medium;
  margin-bottom: 2px;
}

.growth-event-desc {
  font-size: $font-size-caption;
  color: $color-neutral-7;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
}

.growth-event-empty {
  font-size: $font-size-caption;
  color: $color-neutral-5;
  text-align: center;
  padding: $spacing-4 0;
}

/* ===== 任职记录 ===== */
.career-title {
  font-weight: $font-weight-medium;
  color: $color-neutral-10;
  margin-bottom: 4px;
}

.career-desc {
  font-size: $font-size-caption;
  color: $color-neutral-7;
}

/* ===== 只读表单（工作经历 / 教育经历 回显） ===== */
.readonly-form-table {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.readonly-form-head,
.readonly-form-row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 1.4fr 1.2fr 40px;
  gap: $spacing-3;
  align-items: center;
}

.readonly-form-row.form-table-row-7,
.readonly-form-head.form-table-row-7 {
  grid-template-columns: 2fr 1.1fr 0.9fr 0.9fr 1fr 1.1fr 40px;
}

.readonly-form-row.form-table-row-5,
.readonly-form-head.form-table-row-5 {
  grid-template-columns: 1fr 1.2fr 2fr 1.4fr 40px;
}

.readonly-form-head {
  font-size: $font-size-caption;
  color: $color-neutral-7;
  font-weight: $font-weight-medium;
  padding: 0 4px;
}

.readonly-form-row {
  min-width: 0;

  > * {
    min-width: 0;
  }

  :deep(.arco-input-disabled),
  :deep(.arco-range-picker-disabled) {
    background: var(--color-neutral-2) !important;
    border-color: transparent !important;
    color: $color-neutral-10;
  }
}

</style>
