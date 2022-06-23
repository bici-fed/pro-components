import { FunnelPlotFilled } from '@ant-design/icons';
import { Button, DatePicker, Input, InputNumber, Select } from 'antd';
import { forEach, isEmpty, pick } from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useReducer, useState } from 'react';
import { parseDataIndex } from '../../utils';
import useMemoizedFn from '../useAntdResizableHeader/utils/useMemoizedFn';

const { RangePicker } = DatePicker;

export declare type EventValue<DateType> = DateType | null;
export declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;
type RangeDateType = [EventValue<Moment>, EventValue<Moment>];

interface RenderSelectDomProps {
  setSelectedKeys: any;
  selectedKeys: any;
  filters: any;
  fieldProps: any;
  request: any;
}

/**
 * 渲染下拉选
 *
 * @class
 *
 * @param setSelectedKeys
 * @param selectedKeys
 * @param filters
 * @param fieldProps
 * @param request
 */
const RenderSelectDom = ({
  setSelectedKeys,
  selectedKeys,
  filters,
  fieldProps,
  request,
}: RenderSelectDomProps) => {
  const [options, setOptions] = useState(filters);
  const fetchOptions = async () => {
    if (typeof request == 'function') {
      const data = await request();
      setOptions(data);
      fieldProps.options = data;
    }
  };
  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSelect = (c: any) => {
    if (Array.isArray(c)) {
      setSelectedKeys(c);
    } else {
      setSelectedKeys([c]);
    }
  };

  return (
    <Select
      showSearch
      filterOption={(input, option) => {
        // @ts-ignore
        return option?.label.indexOf(input) != -1;
      }}
      optionFilterProp="children"
      {...fieldProps}
      value={selectedKeys}
      style={{ width: '100%', minWidth: 100, maxWidth: 500 }}
      options={options}
      onChange={handleSelect}
    />
  );
};
/**
 *
 * @param columns
 * @param proFilter
 * @param reload
 * @param setProFilter
 */
const useAntdFilterHeader = ({ columns, proFilter, reload, setProFilter }: any) => {
  let searchInput: any = null;
  let onReset: any = null;
  function reducer(state: any, action: any) {
    switch (action.type) {
      case 'updateField':
        return {
          ...state,
          ...action.payload,
        };
      default:
        throw new Error();
    }
  }
  const [filterState, dispatch] = useReducer(reducer, {});
  useEffect(() => {
    const t = {};
    columns.map((column: any) => {
      if (column['defaultFilteredValue']) {
        const dataIndex = parseDataIndex(column.dataIndex) + '';
        t[dataIndex] = column['defaultFilteredValue'];
        dispatch({
          type: 'updateField',
          payload: {
            [dataIndex]: column['defaultFilteredValue'],
          },
        });
      }
      return null;
    });
    // 解决初始化筛选值不再过滤对象中的bug
    setProFilter(t);
  }, [columns]);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    const newDataIndex = parseDataIndex(dataIndex) + '';
    dispatch({
      type: 'updateField',
      payload: {
        [newDataIndex]: selectedKeys,
      },
    });
    confirm();
    reload();
  };

  const handleReset = (clearFilters: any, selectedKeys: any, dataIndex: any, confirm: any) => {
    const newDataIndex = parseDataIndex(dataIndex) + '';
    dispatch({
      type: 'updateField',
      payload: {
        [newDataIndex]: null,
      },
    });
    clearFilters();
    confirm();
    reload();
  };

  const handleDataChange = (date: any, dateString: any, setSelectedKeys: any) => {
    setSelectedKeys([dateString]);
  };

  // 专门处理日期筛选dom
  const dateDom = (setSelectedKeys: any, selectedKeys: string[]) => {
    let value = null;
    let rangeValue: RangeDateType = [null, null];
    if (typeof selectedKeys[0] === 'string') {
      value = moment(selectedKeys[0]);
    } else {
      rangeValue = selectedKeys[0]
        ? [moment(selectedKeys[0][0]), moment(selectedKeys[0][1])]
        : [null, null];
    }
    return {
      date: (
        <DatePicker
          showToday
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateTime: (
        <DatePicker
          showTime
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateWeek: (
        <DatePicker
          picker="week"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateMonth: (
        <DatePicker
          picker="month"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateQuarter: (
        <DatePicker
          picker="quarter"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateYear: (
        <DatePicker
          picker="year"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateRange: (
        <RangePicker
          value={rangeValue}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateTimeRange: (
        <RangePicker
          showTime
          value={rangeValue}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      time: (
        <DatePicker
          picker="time"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
    };
  };

  /** 专门处理数字输入框 * */
  const digitDom = (setSelectedKeys: any, selectedKeys: number[]) => {
    const handleDigitValues = (type: string, value: number) => {
      if (type === 'min' && selectedKeys) {
        setSelectedKeys([value, selectedKeys?.[1]]);
      } else if (selectedKeys) {
        setSelectedKeys([selectedKeys?.[0], value]);
      }
    };
    return {
      digitRange: (
        <>
          <InputNumber
            value={selectedKeys?.[0]}
            onChange={(value) => handleDigitValues('min', value)}
          />
          ~
          <InputNumber
            value={selectedKeys?.[1]}
            onChange={(value) => handleDigitValues('max', value)}
          />
        </>
      ),
      digit: (
        <>
          <InputNumber
            value={selectedKeys?.[0]}
            style={{ width: '100%' }}
            onChange={(value) => setSelectedKeys([value])}
          />
        </>
      ),
    };
  };

  const dateValueTypes = [
    'date',
    'dateTime',
    'dateWeek',
    'dateMonth',
    'dateQuarter',
    'dateYear',
    'dateRange',
    'dateTimeRange',
    'time',
  ];

  const digitValueTypes = ['digit', 'digitRange'];

  /** 自定义列筛选* */
  const getColumnSearchProps = ({
    dataIndex,
    columnName = '关键字',
    valueEnum = {},
    valueType = 'text',
    fieldProps,
    request,
  }: any) => {
    const filters: any = [];
    forEach(valueEnum, (value: any, key) => {
      filters.push({
        label: value.text,
        value: key,
      });
    });
    if (fieldProps && fieldProps.options) {
      filters.length = 0;
      forEach(fieldProps.options, (item: any) => {
        filters.push({
          label: item.label || item.text,
          value: item.value,
        });
      });
    }
    // 原生的下拉选有问题
    // const originTableFilterProps = {
    //   filters,
    //   filterSearch: true,
    //   onFilterDropdownVisibleChange: async (visible: boolean) => {
    //     if (visible && request && typeof request === 'function') {
    //       const data = await request();
    //       filters.length = 0;
    //       forEach(data, (item: any) => {
    //         filters.push({
    //           text: item.label || item.text,
    //           value: item.value,
    //         });
    //       });
    //     }
    //   },
    //   filterIcon: (filtered: any) => (
    //     <FunnelPlotFilled style={{ color: filtered ? '#1890ff' : undefined }} />
    //   ),
    // };
    const newColumnProps = {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={(node: any) => {
                searchInput = node;
              }}
              placeholder={`搜索${columnName}`}
              value={selectedKeys?.[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
              }}
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                disabled={!selectedKeys || selectedKeys.length === 0}
                style={{ width: 50 }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                size="small"
                style={{ width: 50 }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      },
      filterIcon: (filtered: any) => (
        <FunnelPlotFilled style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilterDropdownVisibleChange: (visible: any) => {
        if (visible) {
          setTimeout(() => {
            if (searchInput) {
              searchInput.select();
            }
          }, 100);
        }
      },
    };

    if (dateValueTypes.some((type) => type === valueType)) {
      newColumnProps['filterDropdown'] = ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8 }}>
            {dateDom(setSelectedKeys, selectedKeys)[valueType]}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                disabled={!selectedKeys || selectedKeys.length === 0}
                style={{ width: 50 }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                size="small"
                style={{ width: 50 }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      };
    }
    if (digitValueTypes.some((type) => type === valueType)) {
      newColumnProps['filterDropdown'] = ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8 }}>
            {digitDom(setSelectedKeys, selectedKeys)[valueType]}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                disabled={!selectedKeys || selectedKeys.length === 0}
                style={{ width: 50 }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                size="small"
                style={{ width: 50 }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      };
    }

    if (valueType === 'select') {
      newColumnProps['filterDropdown'] = ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <RenderSelectDom
              setSelectedKeys={setSelectedKeys}
              selectedKeys={selectedKeys}
              filters={filters}
              fieldProps={fieldProps}
              request={request}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 10,
              }}
            >
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                size="small"
                style={{ width: 50 }}
              >
                确定
              </Button>
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                disabled={!selectedKeys || selectedKeys.length === 0}
                style={{ width: 50 }}
              >
                重置
              </Button>
            </div>
          </div>
        );
      };
    }

    return newColumnProps;
  };
  /** 获取最终改造后的列属性信息* */
  const getColumns = useMemoizedFn((list) => {
    const trulyColumns = list?.filter((item: any) => !isEmpty(item));
    const c = trulyColumns.map((col: any) => {
      const param = pick(col, [
        'dataIndex',
        'title',
        'valueEnum',
        'valueType',
        'filteredValue',
        'fieldProps',
        'request',
      ]);
      const extraColumnProps =
        col.search !== false
          ? getColumnSearchProps({
              ...param,
              columnName: col.title,
            })
          : {};
      return {
        ...col,
        ...extraColumnProps,
      };
    });

    return c;
  });

  const newColumns = getColumns(columns);

  return {
    filterColumns: newColumns,
    filterState: {
      ...proFilter,
      ...filterState,
    },
    dispatch,
    onReset,
  };
};

export default useAntdFilterHeader;
