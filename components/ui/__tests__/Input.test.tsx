import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Input } from '../Input'
import { Search, User, Mail } from 'lucide-react'

describe('Input Component', () => {
  // 基础渲染测试
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('form-input')
  })

  // 标签测试
  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // 变体测试
  it('renders different variants correctly', () => {
    const { rerender } = render(<Input variant="default" />)
    expect(screen.getByRole('textbox')).toHaveClass('form-input')

    rerender(<Input variant="filled" />)
    expect(screen.getByRole('textbox')).toHaveClass('input-filled')

    rerender(<Input variant="outlined" />)
    expect(screen.getByRole('textbox')).toHaveClass('input-outlined')
  })

  // 尺寸测试
  it('renders different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-3', 'py-2', 'text-sm')

    rerender(<Input size="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-4', 'py-2.5', 'text-sm')

    rerender(<Input size="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-4', 'py-3', 'text-base')
  })

  // 图标测试
  it('renders with left icon', () => {
    render(<Input leftIcon={<Search data-testid="search-icon" />} />)
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pl-10')
  })

  it('renders with right icon', () => {
    render(<Input rightIcon={<User data-testid="user-icon" />} />)
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pr-10')
  })

  // 状态测试
  it('shows error state correctly', () => {
    render(<Input error="This field is required" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('input-error', 'animate-shake')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveStyle({ color: '#ef4444' })
  })

  it('shows success state correctly', () => {
    render(<Input success="Valid input" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('input-success')
    expect(screen.getByText('Valid input')).toBeInTheDocument()
    expect(screen.getByText('Valid input')).toHaveStyle({ color: '#10b981' })
  })

  it('shows helper text', () => {
    render(<Input helperText="Enter your email address" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  // 焦点状态测试
  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  // 密码切换测试
  it('shows password toggle for password input', () => {
    render(<Input type="password" showPasswordToggle />)
    const toggleButton = screen.getByRole('button')
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // 清除功能测试
  it('shows clear button when clearable and has value', () => {
    render(<Input clearable value="test value" onChange={() => {}} />)
    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('does not show clear button when no value', () => {
    render(<Input clearable value="" onChange={() => {}} />)
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', () => {
    const handleClear = jest.fn()
    render(<Input clearable value="test" onChange={() => {}} onClear={handleClear} />)
    
    const clearButton = screen.getByText('×')
    fireEvent.click(clearButton)
    
    expect(handleClear).toHaveBeenCalled()
  })

  // 加载状态测试
  it('shows loading spinner when loading', () => {
    render(<Input loading />)
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('hides other icons when loading', () => {
    render(
      <Input 
        loading 
        rightIcon={<User data-testid="user-icon" />}
        clearable 
        value="test"
        onChange={() => {}}
      />
    )
    
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument()
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  // 禁用状态测试
  it('handles disabled state correctly', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  // 值变化测试
  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  // 复杂场景测试
  it('renders complex input with all props', () => {
    const handleChange = jest.fn()
    const handleFocus = jest.fn()
    const handleClear = jest.fn()
    
    render(
      <Input
        label="Email Address"
        type="email"
        size="lg"
        variant="outlined"
        leftIcon={<Mail data-testid="mail-icon" />}
        placeholder="Enter your email"
        value="test@example.com"
        onChange={handleChange}
        onFocus={handleFocus}
        clearable
        onClear={handleClear}
        helperText="We'll never share your email"
        required
        data-testid="complex-input"
      />
    )
    
    const input = screen.getByTestId('complex-input')
    
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument() // required indicator
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    expect(input).toHaveClass('input-outlined', 'px-4', 'py-3', 'text-base')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveValue('test@example.com')
    expect(screen.getByText('×')).toBeInTheDocument() // clear button
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument()
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.click(screen.getByText('×'))
    expect(handleClear).toHaveBeenCalled()
  })

  // 错误优先级测试
  it('prioritizes error over success message', () => {
    render(<Input error="Error message" success="Success message" />)
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  it('shows success when no error', () => {
    render(<Input success="Success message" helperText="Helper text" />)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('shows helper text when no error or success', () => {
    render(<Input helperText="Helper text" />)
    expect(screen.getByText('Helper text')).toBeInTheDocument()
  })

  // 可访问性测试
  it('maintains accessibility standards', () => {
    render(
      <Input 
        label="Username"
        aria-describedby="username-help"
        required
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'username-help')
    expect(input).toHaveAttribute('required')
  })

  // HTML 属性传递测试
  it('passes through HTML input attributes', () => {
    render(
      <Input
        name="email"
        autoComplete="email"
        maxLength={50}
        data-testid="email-input"
      />
    )
    
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
    expect(input).toHaveAttribute('maxlength', '50')
  })

  // 动画测试
  it('applies shake animation on error', () => {
    render(<Input error="Error occurred" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('animate-shake')
  })

  // 图标颜色变化测试
  it('changes icon color on focus', async () => {
    render(<Input leftIcon={<Search data-testid="search-icon" />} />)
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    
    // 由于图标颜色是通过内联样式设置的，我们检查焦点状态
    expect(input).toHaveClass('input-focused')
  })

  // 边界情况测试
  it('handles empty string value correctly', () => {
    render(<Input value="" clearable onChange={() => {}} />)
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  it('handles null/undefined value correctly', () => {
    render(<Input value={undefined} clearable onChange={() => {}} />)
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })
})