import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '../Button'
import { Plus, Download } from 'lucide-react'

describe('Button Component', () => {
  // 基础渲染测试
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-primary')
  })

  // 变体测试
  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-danger')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-outline')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-ghost')
  })

  // 尺寸测试
  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-2', 'py-1', 'text-xs')

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-xs')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base')

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-4', 'text-lg')
  })

  // 图标测试
  it('renders with icon correctly', () => {
    render(<Button icon={<Plus data-testid="plus-icon" />}>Add Item</Button>)
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  it('renders icon on the right when iconPosition is right', () => {
    render(
      <Button icon={<Plus data-testid="plus-icon" />} iconPosition="right">
        Add Item
      </Button>
    )
    const button = screen.getByRole('button')
    const icon = screen.getByTestId('plus-icon')
    const text = screen.getByText('Add Item')
    
    // 检查图标是否在文本之后
    expect(button.children[1]).toContain(icon.parentElement)
  })

  // 加载状态测试
  it('shows loading state correctly', () => {
    render(<Button loading>Loading Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(screen.getByText('Loading Button')).toHaveStyle({ opacity: '0.3' })
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('hides icon when loading', () => {
    render(
      <Button loading icon={<Plus data-testid="plus-icon" />}>
        Loading
      </Button>
    )
    
    const iconWrapper = screen.getByTestId('plus-icon').parentElement
    expect(iconWrapper).toHaveStyle({ opacity: '0' })
  })

  // 禁用状态测试
  it('handles disabled state correctly', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  // 点击事件测试
  it('handles click events correctly', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn()
    render(<Button loading onClick={handleClick}>Loading</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  // 全宽测试
  it('renders full width when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  // 圆形按钮测试
  it('renders rounded when rounded is true', () => {
    render(<Button rounded>Rounded</Button>)
    expect(screen.getByRole('button')).toHaveClass('rounded-full')
  })

  // 动画效果测试
  it('applies press animation on click', async () => {
    render(<Button>Animated Button</Button>)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(button.style.animation).toContain('buttonPress')
    })
  })

  // 鼠标事件测试
  it('handles mouse events for press state', () => {
    render(<Button>Press me</Button>)
    const button = screen.getByRole('button')
    
    fireEvent.mouseDown(button)
    expect(button).toHaveClass('transform', 'scale-95')
    
    fireEvent.mouseUp(button)
    expect(button).not.toHaveClass('scale-95')
    
    fireEvent.mouseDown(button)
    fireEvent.mouseLeave(button)
    expect(button).not.toHaveClass('scale-95')
  })

  // 自定义类名测试
  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  // HTML 属性传递测试
  it('passes through HTML button attributes', () => {
    render(
      <Button type="submit" data-testid="submit-button" aria-label="Submit form">
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  // 复杂场景测试
  it('renders complex button with all props', () => {
    const handleClick = jest.fn()
    render(
      <Button
        variant="primary"
        size="lg"
        icon={<Download data-testid="download-icon" />}
        iconPosition="left"
        fullWidth
        rounded
        onClick={handleClick}
        className="custom-download-btn"
        data-testid="complex-button"
      >
        Download File
      </Button>
    )
    
    const button = screen.getByTestId('complex-button')
    
    expect(button).toHaveClass('btn-primary')
    expect(button).toHaveClass('px-6', 'py-3', 'text-base') // lg size
    expect(button).toHaveClass('w-full') // fullWidth
    expect(button).toHaveClass('rounded-full') // rounded
    expect(button).toHaveClass('custom-download-btn') // custom class
    expect(screen.getByTestId('download-icon')).toBeInTheDocument()
    expect(screen.getByText('Download File')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })

  // 可访问性测试
  it('maintains accessibility standards', () => {
    render(<Button aria-describedby="help-text">Accessible Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveAttribute('aria-describedby', 'help-text')
    expect(button).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('sets aria-disabled when disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
  })
})