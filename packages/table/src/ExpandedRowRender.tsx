import Field from '@bicitech-design/pro-field';
import { Descriptions, Space, Tag } from 'antd';
import React, { useMemo } from 'react';
import Container from './container';
import { defaultRowExpandableConfigProps } from './typing';
import { genColumnKey } from './utils';

export type ExpandedRowRenderProps = {
  record: any;
  tableColumns: any;
  rowExpandableConfig: defaultRowExpandableConfigProps;
};

const ExpandedRowRender: React.FC<ExpandedRowRenderProps> = ({
  record,
  tableColumns,
  rowExpandableConfig,
}) => {
  const counter = Container.useContainer();

  /** 需要遍历一下，不然不支持嵌套表格 */
  const columns = useMemo(() => {
    const loopFilter = (column: any[]): any[] => {
      return column
        .map((item) => {
          // 删掉不应该显示的
          const columnKey = genColumnKey(item.key, item.index);
          const config = counter.columnsMap[columnKey];
          if (config && config.show === false) {
            if (item.children) {
              return {
                ...item,
                children: loopFilter(item.children),
              };
            }
            return item;
          }
          return false;
        })
        .filter(Boolean);
    };
    return loopFilter(tableColumns);
  }, [counter.columnsMap, tableColumns]);

  return (
    <div>
      <Descriptions column={rowExpandableConfig?.columnCount}>
        {(rowExpandableConfig?.mode === 'part' ? columns : tableColumns).map((column: any) => {
          const { title, valueType = 'text', key, valueEnum, dataIndex } = column;
          let text = record[key] || record[dataIndex];
          if (Array.isArray(dataIndex)) {
            let rec = record;
            dataIndex.forEach((item) => {
              rec = rec[item];
            });
            text = rec;
          }
          let renderField = null;
          if (typeof text === 'string' || typeof text === 'number') {
            renderField = (
              <Field
                text={text}
                mode="read"
                valueType={typeof valueType === 'function' ? valueType(record) : valueType}
                valueEnum={valueEnum}
              />
            );
          } else if (Array.isArray(text)) {
            // 是一个数组，表示是标签
            renderField = (
              <Field
                text={text}
                mode="read"
                valueType={typeof valueType === 'function' ? valueType(record) : valueType}
                valueEnum={valueEnum}
                render={() => {
                  return (
                    <Space>
                      {text.map(({ name, color }: any) => (
                        <Tag color={color} key={name}>
                          {name}
                        </Tag>
                      ))}
                    </Space>
                  );
                }}
              />
            );
          } else if (typeof text === 'object') {
            // object
            if (text.text) {
              // 说明是单个标签
              renderField = (
                <Field
                  text={text.text}
                  mode="read"
                  valueType={typeof valueType === 'function' ? valueType(record) : valueType}
                  valueEnum={valueEnum}
                  render={() => (
                    <Tag color={text.color} key={text.text}>
                      {text.text}
                    </Tag>
                  )}
                />
              );
            }
          } else if (
            valueType === 'indexBorder' ||
            valueType === 'index' ||
            valueType === 'option'
          ) {
            // 此三种类型是序号、操作栏，显示
            renderField = null;
            text = '';
            return null;
          } else {
            renderField = null;
            text = '';
            return null;
          }
          return (
            <Descriptions.Item label={title} key={column.key}>
              {renderField}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    </div>
  );
};

export default ExpandedRowRender;
