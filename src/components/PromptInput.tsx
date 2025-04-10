import {
  BorderOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Radio, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import type { RunType } from './playground-types';
import type { ServiceModeType } from './playground-types';
import { actionNameForType, getPlaceholderForType } from './playground-utils';

const { TextArea } = Input;

interface PromptInputProps {
  runButtonEnabled: boolean;
  form: any;
  serviceMode: ServiceModeType;
  selectedType: RunType;
  dryMode: boolean;
  stoppable: boolean;
  loading: boolean;
  onRun: () => void;
  onStop: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  runButtonEnabled,
  form,
  selectedType,
  dryMode,
  stoppable,
  loading,
  onRun,
  onStop,
}) => {
  const [hoveringSettings, setHoveringSettings] = useState(false);
  const placeholder = getPlaceholderForType(selectedType);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Initialize form values from history only when lastHistory changes
  useEffect(() => {
    form.setFieldsValue({
      type: 'aiAction',
      prompt: '',
    });
  }, [form]);

  // Handle run with history addition
  const handleRunWithHistory = useCallback(() => {
    onRun();
  }, [form, onRun]);

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && e.metaKey) {
        handleRunWithHistory();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [handleRunWithHistory],
  );

  // Handle settings hover state
  const handleMouseEnter = useCallback(() => {
    setHoveringSettings(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveringSettings(false);
  }, []);

  // Render action button based on current state
  const renderActionButton = useCallback(() => {
    const runButton = (text: string) => (
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleRunWithHistory}
        disabled={!runButtonEnabled}
        loading={loading}
      >
        {text}
      </Button>
    );

    if (dryMode) {
      return selectedType === 'aiAction' ? (
        <Tooltip title="Start executing until some interaction actions need to be performed. You can see the process of planning and locating.">
          {runButton('Dry Run')}
        </Tooltip>
      ) : (
        runButton('Run')
      );
    }

    if (stoppable) {
      return (
        <Button icon={<BorderOutlined />} onClick={onStop}>
          Stop
        </Button>
      );
    }

    return runButton('Run');
  }, [
    dryMode,
    loading,
    handleRunWithHistory,
    onStop,
    runButtonEnabled,
    selectedType,
    stoppable,
  ]);

  return (
    <div className="form-part input-wrapper">
      <Form.Item name="type">
        <Radio.Group buttonStyle="solid" disabled={!runButtonEnabled}>
          <Radio.Button value="aiAction">
            {actionNameForType('aiAction')}
          </Radio.Button>
          <Radio.Button value="aiQuery">
            {actionNameForType('aiQuery')}
          </Radio.Button>
        </Radio.Group>
        <Button
          className="left-36 relative"
          onClick={() => {
            if (isPaused) {
              chrome.tts.resume();
            } else {
              chrome.tts.pause();
            }
            setIsPaused(!isPaused);
          }}
          icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
        />
      </Form.Item>
      <div className="main-side-console-input">
        <Form.Item name="prompt">
          <TextArea
            disabled={!runButtonEnabled}
            rows={4}
            placeholder={placeholder}
            autoFocus
            onKeyDown={handleKeyDown}
          />
        </Form.Item>

        <div className="form-controller-wrapper">
          <div
            className={
              hoveringSettings
                ? 'settings-wrapper settings-wrapper-hover'
                : 'settings-wrapper'
            }
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};
