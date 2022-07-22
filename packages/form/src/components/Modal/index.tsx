import React from 'react';
import { Modal as ANTModal } from 'antd';
import type { ModalProps } from 'antd';
import Draggable from 'react-draggable';
import _ from 'lodash';
import { WuiModalProps } from './typing';
import {s8} from '../utils/uuid';


export type { WuiModalProps };

function parentUntil(ele: any, eleId: string) {
  let parent = undefined;
  do{
    const pd = ele.parentNode||ele.parentElement;
    if(document.getElementById(eleId)==pd){
      parent = pd;
    }
  }while (!parent)
  return parent;
}

class Modal extends React.Component<WuiModalProps<ModalProps>> {
  state = {
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    disabled: false,
  };

  id=s8();

  componentDidMount() {
    this.setState({disabled: this.props.draggable});
  }

  draggleRef = React.createRef() as any;
  titleRef = React.createRef() as any;

  onStart = (event: any, uiData: any) => {

    let parentDom = event.target;
    if(document.getElementById(this.id)!==parentDom){
      parentDom = parentUntil(parentDom,this.id)
    }
    if(this.titleRef.current!=parentDom){
      return;
    }
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = (this.draggleRef.current as any)?.getBoundingClientRect();
    if(parentDom.dataset.drag!=='yes'){
      return;
    }
    if (!targetRect) {
      return;
    }
    this.setState({
      bounds: {
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y),
      },
    });
  };



  render() {
    const { bounds } = this.state;
    const restProps = _.omit(this.props, ['modalRender', 'title']);
    const { draggable } = this.props;
    return (
      <>
        <ANTModal
          title={
            <div
              ref={this.titleRef}
              style={{
                width: '100%',
                cursor: draggable ? 'move' : 'default',
              }}
              id={this.id}
              data-drag="yes"
              onMouseOver={() => {
                if(this.props.draggable){
                  this.setState({disabled: true})
                }
              }}

              onMouseOut={() => {
                this.setState({disabled: false})
              }}
              onMouseDown={(e)=>{
                e.cancelable=true;
              }
              }
              // fix eslintjsx-a11y/mouse-events-have-key-events
              // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
              onFocus={() => {}}
              onBlur={() => {}}


              // end
            >
              {this.props.title}
            </div>
          }
          {...restProps}
          modalRender={(modal) => (
            <Draggable
              disabled={!this.state.disabled}
              bounds={bounds}
              onStart={(event, uiData) => {this.onStart(event, uiData)}}
            >
              <div ref={this.draggleRef}>{modal}</div>
            </Draggable>
          )}
        >
          {this.props.children}
        </ANTModal>
      </>
    );
  }
}

export default Modal;
