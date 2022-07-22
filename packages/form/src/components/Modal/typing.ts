import type { ModalProps } from 'antd/lib/modal';

export type WuiModalProps<T> = {
  /**
   * 可以这样写属性描述
   * @description       对话框是否可拖动
   * @description.zh-CN 还支持不同的 locale 后缀来实现多语言描述，使用 description 兜底
   * @default           true
   */
  draggable?: boolean;
} & Omit<ModalProps, 'draggable'>;
